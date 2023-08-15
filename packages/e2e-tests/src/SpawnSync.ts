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

class SpawnSync implements ExecSyncInterface {
	constructor(private readonly cwd: string) {}

	public call(
		cmd: string,
		args: string[] = [],
		opts: {
			cwd?: SpawnSyncOptions['cwd'];
			input?: SpawnSyncOptions['input'];
			stdin?: IOType;
			stdout?: IOType;
			stderr?: IOType;
			env?: ProcessEnvOptions['env'];
		} = {}
	): SpawnSyncReturns<string> {
		const [command, arg0] = this.overrideCommand(cmd);
		const cwd = this.getCwd(opts.cwd);
		const stdin = opts.stdin ?? 'inherit';
		const stdout = opts.stdout ?? 'inherit';
		const stderr = opts.stderr ?? 'inherit';
		const stdio: StdioOptions = [stdin, stdout, stderr];
		const env = { ...opts.env, ...process.env };

		if (arg0) {
			args.unshift(arg0);
		}

		const options: SpawnSyncOptionsWithStringEncoding = {
			cwd: cwd,
			input: opts.input,
			stdio: stdio,
			env: env,
			encoding: 'utf8',
		};

		const buffer = child_process.spawnSync(command, args, options);

		if (buffer.status !== 0) {
			core.setFailed(`Failed to execute command! \ncommand: ${command} \nargs: ${args.join(', ')}`);
		}

		return buffer;
	}

	private overrideCommand(command: string): [string, string | undefined] {
		const targets = ['node', 'yarn', 'npm', 'npx'];
		if (!targets.includes(command)) {
			return [command, undefined];
		}
		return [process.execPath, this.which(command)];
	}

	private which(command: string): string {
		return this.call('which', [command], { stdout: 'pipe' }).stdout.trim();
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

export { SpawnSync };
export type { ExecSyncInterface };
