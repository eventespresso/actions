import { Cache } from './Cache';
import { SpawnSync } from './SpawnSync';
import { Repository } from './Repository';
import { EnvVars } from './Action';
import { Artifact } from './Artifact';
import { Tar } from './Tar';
import { GPG } from './GPG';
import { error, log } from './utilities';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';

class Yarn {
	constructor(
		private readonly repo: Repository,
		private readonly spawnSync: SpawnSync,
		private readonly cache: Cache,
		private readonly artifact: Artifact,
		private readonly tar: Tar,
		private readonly gpg: GPG
	) {}

	public async install({ frozenLockfile }: { frozenLockfile: boolean }): Promise<Yarn> {
		const args = ['install'];

		if (frozenLockfile) {
			args.push('--frozen-lockfile');
		}

		await this.call(args, ['node_modules', '*/node_modules']);

		return this;
	}

	public async build(): Promise<Yarn> {
		await this.call(['build'], ['build']);
		return this;
	}

	protected async makeEnvVars(envVars: EnvVars): Promise<Record<string, string>> {
		const caRoot = await this.spawnSync.call('mkcert', ['-CAROOT'], { stdout: 'pipe' }).stdout.trim();
		const { htmlReportPath } = this.getPlaywrightPaths();
		const envBase = {
			NODE_EXTRA_CA_CERTS: `${caRoot}/rootCA.pem`,
			PLAYWRIGHT_HTML_REPORT: htmlReportPath,
		} as const satisfies Record<string, string>;
		return { ...envBase, ...envVars };
	}

	protected getPlaywrightPaths(): Record<string, string> {
		const htmlReportPath = path.resolve(os.tmpdir(), 'playwright-report');
		const resultsPath = path.resolve(os.tmpdir(), 'playwright-test-results');
		return { htmlReportPath, resultsPath };
	}

	/**
	 * Runs the given `npmScript`
	 * (assumes will call Playwright, special logic for saving Playwright artifacts)
	 */
	protected async runPlaywrightAsNpmScript(npmScript: string, envVars: EnvVars): Promise<Yarn> {
		const env = await this.makeEnvVars(envVars);
		const { resultsPath, htmlReportPath } = this.getPlaywrightPaths();

		// if docker cache will become available, restore should be called here

		const buffer = this.spawnSync.call('yarn', [npmScript, `--output=${resultsPath}`], {
			env,
			noAnnotation: true,
			noException: true,
		});

		// if docker cache will become available, save should be called here

		if (buffer.status !== 0) {
			await this.saveHtmlReport(htmlReportPath);
			await this.saveTestResults(resultsPath);
			core.setFailed(`NPM script '${npmScript}' did not pass successfully!`);
		}

		return this;
	}

	public async setup(envVars: EnvVars): Promise<Yarn> {
		return this.runPlaywrightAsNpmScript('setup', envVars);
	}

	public async test(envVars: EnvVars): Promise<Yarn> {
		return this.runPlaywrightAsNpmScript('test', envVars);
	}

	private saveArtifact(
		file: string,
		report: {
			name: string;
			expiry: number; // in days
		}
	): boolean | Promise<boolean> {
		if (!fs.existsSync(file)) {
			error('Cannot save artifact at the given path as the file is not found!', 'File path: ' + file);
			return false;
		}

		const tarball = this.tar.create(file);

		if (!tarball) {
			return false;
		}

		const gpg = this.gpg.encrypt(tarball);

		if (!gpg) {
			return false;
		}

		const fileName = path.basename(gpg);
		const rootDir = path.dirname(gpg);

		return this.artifact.save(fileName, rootDir, report.name, report.expiry);
	}

	private async saveHtmlReport(reportPath: string): Promise<boolean> {
		// include workflow # as well as attempt # in the report (artifact) filename
		const name = `playwright-report-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;
		const expiry = 7; // days

		return await this.saveArtifact(reportPath, { name, expiry });
	}

	private async saveTestResults(resultsPath: string): Promise<boolean> {
		// include workflow # as well as attempt # in results (artifact) filename
		const name = `playwright-test-results-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;
		const expiry = 7; // days

		return await this.saveArtifact(resultsPath, { name, expiry });
	}

	/**
	 * Bind Yarn cache to sha256 of `package.json` and `yarn.lock` as output/outcome of commands may change when dependencies change
	 * @param action Yarn action we are running
	 * @returns Promise with cache key as string
	 */
	private async makeCacheKey(action: string): Promise<string> {
		const manifest = await this.getFileSha256('package.json');
		const lockfile = await this.getFileSha256('yarn.lock');
		return `${action}-${manifest}-${lockfile}`;
	}

	/**
	 * Get SHA-256 of the file relative to the root of the repository
	 */
	private getFileSha256(file: string): Promise<string> {
		return glob.hashFiles(path.resolve(this.repo.cwd, file), this.repo.cwd);
	}

	/**
	 * Bind cache to specific commands to avoid collisions and ensure each Yarn command is saved under unique cache as we are working with 3 different repositories
	 * @param args arguments for Yarn cli command
	 * @param paths array of path to be cached (relative or absolute)
	 * @returns empty Promise
	 */
	private async call(args: string[], paths: string[]): Promise<void> {
		// in case of relative paths, resolve it into absolute path against cwd
		paths = paths.map((p) => path.resolve(this.repo.cwd, p));

		const action = `yarn-${args.join('-')}`;
		const key = await this.makeCacheKey(action);

		const cache = await this.cache.restore(key, paths);

		// if cache was found, the *outcome* of the command was cached
		// so there is no need to waste cpu cycles running it again
		if (cache) {
			log(`Found yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);
			return;
		}

		log(`Did not find yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);

		this.spawnSync.call('yarn', args);

		await this.cache.save(key, paths);
	}
}

export { Yarn };
