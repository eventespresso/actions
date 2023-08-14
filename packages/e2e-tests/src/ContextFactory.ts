import { Cache } from './Cache';
import { Context } from './Context';
import { ExecSync } from './ExecSync';
import { Git } from './Git';
import { RepositoryFactory } from './RepositoryFactory';
import { Yarn } from './Yarn';

class ContextFactory {
	constructor(private readonly repos: RepositoryFactory) {}

	public make(type: keyof RepositoryFactory, branch: string): Context {
		const repo = this.repos[type](branch);
		const git = new Git(repo);
		const cache = new Cache(repo);
		const exec = new ExecSync(repo.cwd);
		const yarn = new Yarn(repo, exec, cache);
		return new Context(repo, cache, yarn, git);
	}
}

export { ContextFactory };
