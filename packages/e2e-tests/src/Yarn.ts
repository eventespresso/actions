import * as os from 'os';
import * as path from 'path';
import { Cache } from './Cache';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { SpawnSync } from './SpawnSync';
import { Repository } from './Repository';
import { EnvVars } from './Action';
import { Artifact } from './Artifact';

class Yarn {
	constructor(
		private readonly repo: Repository,
		private readonly spawnSync: SpawnSync,
		private readonly cache: Cache,
		private readonly artifact: Artifact
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

	public async test(envVars: EnvVars): Promise<Yarn> {
		const caRoot = this.spawnSync.call('mkcert', ['-CAROOT'], { stdout: 'pipe' }).stdout.trim();

		// used by env var NODE_EXTRA_CA_CERTS
		// see https://playwright.dev/docs/test-reporters#html-reporter
		// used by CLI
		// see https://playwright.dev/docs/test-cli#reference
		const reportPath = path.resolve(os.tmpdir(), 'playwright-report');
		const resultsPath = path.resolve(os.tmpdir(), 'playwright-test-results');

		const env = {
			NODE_EXTRA_CA_CERTS: `${caRoot}/rootCA.pem`,
			PLAYWRIGHT_HTML_REPORT: reportPath,
			...envVars,
		} as const;

		// if docker cache will become available, restore should be called here

		const buffer = this.spawnSync.call('yarn', ['playwright', 'test', `--output=${resultsPath}`], {
			env,
		});

		// if docker cache will become available, save should be called here

		if (buffer.status !== 0) {
			await this.saveReport(reportPath);
			await this.saveTestResults(resultsPath);
		}

		return this;
	}

	private async saveReport(reportPath: string): Promise<boolean> {
		// include workflow # as well as attempt # in the report (artifact) filename
		const reportName = `playwright-report-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;

		return await this.artifact.save('*', reportPath, reportName, 7);
	}

	private async saveTestResults(resultsPath: string): Promise<boolean> {
		// include workflow # as well as attempt # in results (artifact) filename
		const resultsName = `playwright-test-results-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;

		return await this.artifact.save('*', resultsPath, resultsName, 7);
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
			core.info(`Found yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);
			return;
		}

		core.notice(
			`Did not find yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`
		);

		this.spawnSync.call('yarn', args);

		await this.cache.save(key, paths);
	}
}

export { Yarn };
