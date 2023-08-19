import * as os from 'os';
import * as path from 'path';
import { Cache } from './Cache';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as artifact from '@actions/artifact';
import { SpawnSync } from './SpawnSync';
import { Repository } from './Repository';
import { EnvVars } from './Action';

class Yarn {
	constructor(
		private readonly repo: Repository,
		private readonly spawnSync: SpawnSync,
		private readonly cache: Cache
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
		// TODO: once e2e-tests package is extracted, update this

		const caRoot = this.spawnSync.call('mkcert', ['-CAROOT'], { stdout: 'pipe' }).stdout.trim();

		const reportPath = path.resolve(os.tmpdir(), 'playwright-report');

		const env = {
			NODE_EXTRA_CA_CERTS: `${caRoot}/rootCA.pem`,
			PLAYWRIGHT_HTML_REPORT: reportPath,
			...envVars,
		} as const;

		// if docker cache will become available, restore should be called here

		const buffer = this.spawnSync.call('yarn', ['workspace', '@eventespresso/e2e', 'playwright', 'test'], {
			env,
		});

		// if docker cache will become available, save should be called here

		if (buffer.status !== 0) {
			await this.saveTestReport(reportPath);
		}

		return this;
	}

	private async saveTestReport(reportPath: string): Promise<void> {
		core.notice(`Saving Playwright report found at: ${reportPath}`);

		const client = artifact.create();

		const pattern = path.resolve(reportPath, '**/*');

		const globber = await glob.create(pattern);

		const files = await globber.glob();

		const reportName = `playwright-report-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;

		let response = undefined;

		try {
			response = await client.uploadArtifact(reportName, files, reportPath, {
				continueOnError: true,
				retentionDays: 7,
			});
		} catch (error) {
			core.error(error as string);
			return;
		}

		if (response.failedItems.length > 0) {
			core.error(`Failed to upload some artifact items: \n${response.failedItems.join(', ')}`);
		}
	}

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

	private async call(args: string[], paths: string[]): Promise<void> {
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
