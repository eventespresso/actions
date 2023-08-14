import { Cache } from './Cache';
import { ExecSync } from './ExecSync';
import { Git } from './Git';
import { Repository } from './Repository';
import { Yarn } from './Yarn';

class Context {
	private readonly execSync: ExecSync;

	constructor(
		public readonly repo: Repository,
		public readonly cache: Cache,
		public readonly yarn: Yarn,
		public readonly git: Git
	) {
		this.execSync = new ExecSync(repo.cwd);
	}

	public get cwd(): string {
		return this.repo.cwd;
	}

	public run(command: string, env: Record<string, string> = {}): Context {
		this.execSync.void(command, env);
		return this;
	}
}

export { Context };
