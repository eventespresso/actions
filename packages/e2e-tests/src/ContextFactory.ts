import { Cache } from './Cache';
import { Context } from './Context';
import { SpawnSync } from './SpawnSync';
import { Git } from './Git';
import { RepositoryFactory } from './RepositoryFactory';
import { Yarn } from './Yarn';
import { Artifact } from './Artifact';
import { Tar } from './Tar';
import { GPG } from './GPG';
import { InputFactory } from './InputFactory';

class ContextFactory {
	constructor(private readonly repos: RepositoryFactory) {}

	public make(type: keyof RepositoryFactory, branch: string): Context {
		const repo = this.repos[type](branch);
		const git = new Git(repo);
		const cache = new Cache(repo);
		const spawn = new SpawnSync(repo.cwd);
		const artifact = new Artifact();
		const tar = new Tar();
		const inputs = new InputFactory();
		const gpg = new GPG(inputs);
		const yarn = new Yarn(repo, spawn, cache, artifact, tar, gpg);
		return new Context(repo, cache, yarn, git);
	}
}

export { ContextFactory };
