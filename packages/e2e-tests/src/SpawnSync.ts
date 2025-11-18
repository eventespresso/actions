import { error, errorForSpawnSync, annotation } from './utilities';
import * as fs from 'node:fs';
import * as child_process from 'node:child_process';
import type {
	ProcessEnvOptions,
	StdioOptions,
	IOType,
	SpawnSyncReturns,
	SpawnSyncOptions,
	SpawnSyncOptionsWithStringEncoding,
} from 'node:child_process';

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
			noAnnotation?: boolean; // should GitHub annotation be silenced?
			noException?: boolean; // should exception be *not* thrown?
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
			errorForSpawnSync(
				buffer,
				'Failed to execute command!',
				'Command: ' + command,
				'Arguments: ' + args.join(', ')
			);
			if (!opts.noAnnotation) {
				annotation(`Failed to execute '${command}'! (click for more details)`);
			}
			if (!opts.noException) {
				throw new Error(buffer?.error?.message ?? buffer.stderr);
			}
		}

		return buffer;
	}

	/**
	 * For node, yarn, npm, and npx resolve to absolute path so that
	 * command is run on the same Node version as action.yml does
	 * @param command actual cli command to run
	 * @returns tuple of commands
	 */
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
				error(
					`Attempting to override 'cwd'...`,
					'Given value points to a non-existing path!',
					'Path: ' + override
				);
				annotation(`Trying to use invalid value for 'cwd' when executing command!`);
				throw new Error();
			}
			return override;
		}

		// if cwd will be non-existing directory, Node will return ENOENT;
		// in case of commands like 'git clone', working directory *has*
		// to be missing, so we provide middle ground here
		if (!fs.existsSync(this.cwd)) {
			return __dirname;
		}

		return this.cwd;
	}
}

export { SpawnSync };
export type { ExecSyncInterface };
