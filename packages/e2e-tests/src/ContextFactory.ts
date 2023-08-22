import { Cache } from './Cache';
import { Context } from './Context';
import { SpawnSync } from './SpawnSync';
import { Git } from './Git';
import { RepositoryFactory } from './RepositoryFactory';
import { Yarn } from './Yarn';

class ContextFactory {
	constructor(private readonly repos: RepositoryFactory) {}

	public make(type: keyof RepositoryFactory, branch: string): Context {
		const repo = this.repos[type](branch);
		const git = new Git(repo);
		const cache = new Cache(repo);
		const spawn = new SpawnSync(repo.cwd);
		const yarn = new Yarn(repo, spawn, cache);
		return new Context(repo, cache, yarn, git);
	}
}

export { ContextFactory };
