import { Cache } from './Cache';
import { SpawnSync, ExecSyncInterface } from './SpawnSync';
import { Git } from './Git';
import { Repository } from './Repository';
import { Yarn } from './Yarn';
import type { SpawnSyncOptions, ProcessEnvOptions, SpawnSyncReturns, IOType } from 'child_process';

class Context implements ExecSyncInterface {
	private readonly spawnSync: SpawnSync;

	constructor(
		public readonly repo: Repository,
		public readonly cache: Cache,
		public readonly yarn: Yarn,
		public readonly git: Git
	) {
		this.spawnSync = new SpawnSync(repo.cwd);
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
		return this.spawnSync.call(command, args, opts);
	}
}

export { Context };
