import * as path from 'path';
import { Cache } from './Cache';
import * as glob from '@actions/glob';
import { ExecSync } from './ExecSync';
import { Repository } from './Repository';

class Yarn {
	constructor(
		private readonly repo: Repository,
		private readonly execSync: ExecSync,
		private readonly cache: Cache
	) {}

	public async install({ frozenLockfile }: { frozenLockfile: boolean }): Promise<Yarn> {
		const args = ['install'];

		if (frozenLockfile) {
			args.push('--frozen-lockfile');
		}

		await this.execSyncCached(args, ['node_modules', '*/node_modules']);

		return this;
	}

	public async build(): Promise<Yarn> {
		await this.execSyncCached(['build'], ['build']);
		return this;
	}

	public test(env: Record<string, string>): Yarn {
		// TODO: once e2e-tests package is extracted, update this
		this.execSync.call('yarn', ['workspace', '@eventespresso/e2e', 'test'], { env });
		return this;
	}

	private async makeCacheKey(action: string): Promise<string> {
		const manifest = await this.getFileSha256('package.json');
		const lockfile = await this.getFileSha256('yarn.lock');
		return `${action}-${manifest}-${lockfile}`;
	}

	private async makeCacheOptKeys(action: string): Promise<string[]> {
		const manifest = await this.getFileSha256('package.json');
		return [`${action}-${manifest}`, action];
	}

	/**
	 * Get SHA-256 of the file relative to the root of the repository
	 */
	private getFileSha256(file: string): Promise<string> {
		return glob.hashFiles(path.resolve(this.repo.cwd, file));
	}

	private async execSyncCached(args: string[], paths: string[]): Promise<void> {
		const action = `yarn-${args.join('-')}`;
		const key = await this.makeCacheKey(action);
		const optKeys = await this.makeCacheOptKeys(action);
		const _paths = paths.map((_p) => path.resolve(this.repo.cwd, _p));

		const cache = await this.cache.restore(key, _paths, optKeys);

		// if cache was found, the *outcome* of the command was cached
		// so there is no need to waste cpu cycles running it again
		if (cache) {
			return;
		}

		this.execSync.call('yarn', args);

		await this.cache.save(key, _paths);
	}
}

export { Yarn };
