import { Cache } from './Cache';
import { SpawnSync } from './SpawnSync';
import { Repository } from './Repository';
import * as core from '@actions/core';

class Git {
	private readonly spawnSync: SpawnSync;
	private readonly cache: Cache;

	constructor(private readonly repo: Repository) {
		this.spawnSync = new SpawnSync(repo.cwd);
		this.cache = new Cache(repo);
	}

	public async clone(): Promise<Git> {
		const sha = this.getLastCommitSha();
		const key = `git-clone-${sha}`;
		const cloneFromRemote = (): void => {
			this.spawnSync.call('git', [
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
			return this.cache.restore(key, [this.repo.cwd]);
		};
		if (await cloneFromCache()) {
			core.info(`Found git repository '${this.repo.name}' in cache`);
			return this;
		}
		core.notice(`Did not find git repository '${this.repo.name}' in cache, cloning from remote`);
		cloneFromRemote();
		await this.cache.save(key, [this.repo.cwd]);
		return this;
	}

	private getLastCommitSha(): string {
		// courtesy of https://stackoverflow.com/a/15679887/4343719
		const ref = `refs/heads/${this.repo.branch}`;

		// courtesy of https://stackoverflow.com/a/24750310/4343719
		const git = this.spawnSync.call('git', ['ls-remote', this.repo.remote, ref], {
			stdout: 'pipe',
		});

		const stdout = this.spawnSync.call('awk', ['{ print $1 }'], { input: git.stdout, stdout: 'pipe' }).stdout;

		if (!stdout || stdout.length === 0) {
			core.setFailed(
				`Failed to obtain latest commit sha for repository '${this.repo.name}' for branch '${this.repo.branch}'`
			);
		}

		return stdout;
	}
}

export { Git };
