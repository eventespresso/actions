import * as fs from 'fs';
import * as core from '@actions/core';
import * as child_process from 'child_process';
import type {
	ProcessEnvOptions,
	StdioOptions,
	IOType,
	SpawnSyncReturns,
	SpawnSyncOptions,
	SpawnSyncOptionsWithStringEncoding,
} from 'child_process';

type Call = (
	command: string,
	args: string[],
	opts: {
		input?: SpawnSyncOptions['input'];
		stdin?: IOType;
		stdout?: IOType;
		env?: ProcessEnvOptions['env'];
	}
) => SpawnSyncReturns<string>;

interface ExecSyncInterface {
	call: Call;
}

class ExecSync implements ExecSyncInterface {
	constructor(private readonly cwd: string) {}

	public call(
		command: string,
		args: string[] = [],
		opts: {
			cwd?: SpawnSyncOptions['cwd'];
			input?: SpawnSyncOptions['input'];
			stdin?: IOType;
			stdout?: IOType;
			env?: ProcessEnvOptions['env'];
		} = {
			env: {},
		}
	): SpawnSyncReturns<string> {
		const cwd = this.getCwd(opts.cwd);
		const argv0 = process.execArgv.join(' ');
		const stdio: StdioOptions = [opts.stdin, opts.stdout, 'pipe'];
		const env = { ...opts.env, ...process.env };

		const options: SpawnSyncOptionsWithStringEncoding = {
			cwd: cwd,
			input: opts.input,
			argv0: argv0,
			stdio: stdio,
			env: env,
			encoding: 'utf8',
		};

		const buffer = child_process.spawnSync(command, args, options);

		if (buffer.status !== 0) {
			core.setFailed(
				[
					`Failed to execute command!`,
					`command: ${command}`,
					`args: ${args.join(', ')}`,
					`stderr:`,
					buffer.stderr.toString(),
				].join('\n')
			);
		}

		return buffer;
	}

	private getCwd(override?: SpawnSyncOptions['cwd']): SpawnSyncOptions['cwd'] {
		if (override) {
			if (!fs.existsSync(override)) {
				core.setFailed(`cwd does not exist: \n${override}`);
			}
			return override;
		}

		if (!fs.existsSync(this.cwd)) {
			return __dirname;
		}

		return this.cwd;
	}
}

export { ExecSync };
export type { ExecSyncInterface };
