import { Cache } from './Cache';
import { ExecSync } from './ExecSync';
import { Repository } from './Repository';
import * as core from '@actions/core';

class Git {
	private readonly execSync: ExecSync;
	private readonly cache: Cache;

	constructor(private readonly repo: Repository) {
		this.execSync = new ExecSync(repo.cwd);
		this.cache = new Cache(repo);
	}

	public async clone(): Promise<Git> {
		const cacheKey = this.getCacheKey();
		const optKeys = this.getOptCacheKeys();
		const cloneFromRemote = (): void => {
			this.execSync.call('git', [
				'clone',
				'--branch',
				this.repo.branch,
				'--single-branch',
				'--no-tags',
				this.repo.remote,
				this.repo.cwd,
			]);
		};
		const cloneFromCache = (): Promise<boolean> => {
			return this.cache.restore(cacheKey, [this.repo.cwd], optKeys);
		};
		if (await cloneFromCache()) {
			core.info(`Found git repository '${this.repo.name}' in cache`);
			return this;
		}
		core.notice(`Did not find git repository '${this.repo.name}' in cache, cloning from remote`);
		cloneFromRemote();
		await this.cache.save(cacheKey, [this.repo.cwd]);
		return this;
	}

	private getCacheKey(): string {
		return `git-${this.repo.name}-${this.repo.branch}-${this.getLastCommitSha()}`;
	}

	private getOptCacheKeys(): string[] {
		return [`git-${this.repo.name}-${this.repo.branch}-`, `git-${this.repo.name}-`, 'git-'];
	}

	private getLastCommitSha(): string {
		// courtesy of https://stackoverflow.com/a/24750310/4343719
		const git = this.execSync.call('git', ['ls-remote', this.repo.remote, 'HEAD'], {
			stdout: 'pipe',
		});
		return this.execSync.call('awk', ['{ print $1 }'], { input: git.stdout, stdout: 'pipe' }).stdout;
	}
}

export { Git };
