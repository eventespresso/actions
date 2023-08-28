import { Cache } from './Cache';
import { Context } from './Context';
import { SpawnSync } from './SpawnSync';
import { Git } from './Git';
import { RepositoryFactory } from './RepositoryFactory';
import { Yarn } from './Yarn';
import { Artifact } from './Artifact';

class ContextFactory {
	constructor(private readonly repos: RepositoryFactory) {}

	public make(type: keyof RepositoryFactory, branch: string): Context {
		const repo = this.repos[type](branch);
		const git = new Git(repo);
		const cache = new Cache(repo);
		const spawn = new SpawnSync(repo.cwd);
		const artifact = new Artifact();
		const yarn = new Yarn(repo, spawn, cache, artifact);
		return new Context(repo, cache, yarn, git);
	}
}

export { ContextFactory };
