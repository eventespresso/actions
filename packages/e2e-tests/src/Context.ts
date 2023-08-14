import { IOType } from 'child_process';
import { Cache } from './Cache';
import { ExecSync, ExecSyncInterface } from './ExecSync';
import { Git } from './Git';
import { Repository } from './Repository';
import { Yarn } from './Yarn';
import type { SpawnSyncOptions, ProcessEnvOptions, SpawnSyncReturns } from 'child_process';

class Context implements ExecSyncInterface {
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

	call(
		command: string,
		args: string[] = [],
		opts: {
			input?: SpawnSyncOptions['input'];
			stdin?: IOType;
			stdout?: IOType;
			env?: ProcessEnvOptions['env'];
		} = {}
	): SpawnSyncReturns<string> {
		return this.execSync.call(command, args, opts);
	}
}

export { Context };
