import { Cache } from './Cache';
import { SpawnSync } from './SpawnSync';
import { Repository } from './Repository';
import { log, error, notice } from './utilities';

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
			log(`Found git repository '${this.repo.name}' in cache`);
			return this;
		}
		log(`Did not find git repository '${this.repo.name}' in cache, cloning from remote`);
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

		// courtesy of https://stackoverflow.com/a/24750310/4343719
		const cut = this.spawnSync.call('cut', ['-f', '1'], { input: git.stdout, stdin: 'pipe', stdout: 'pipe' });

		const sha = cut.stdout;

		if (!sha || sha.length === 0) {
			error(
				'Details of the git parameters:',
				'Repository: ' + this.repo.name,
				'Branch: ' + this.repo.branch,
				'Remote refs: ' + git.stdout,
				'Commit sha: ' + sha
			);
			const message = 'Failed to obtain the latest git  commit sha for the given repository and branch!';
			notice(message + ' (click for more details)');
			throw new Error(message);
		}

		return sha;
	}
}

export { Git };
