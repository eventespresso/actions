import * as core from '@actions/core';
import * as child_process from 'child_process';
import type { StdioOptions, SpawnSyncReturns } from 'child_process';

class ExecSync {
	constructor(private readonly cwd: string) {}

	public void(command: string, env: Record<string, string> = {}): void {
		this.callBinWithArgs(...this.getParamsForExec(command, env));
	}

	public stdout(command: string, env: Record<string, string> = {}): string {
		const stdio: StdioOptions = ['inherit', 'pipe', 'pipe'];
		const buffer = this.callBinWithArgs(...this.getParamsForExec(command, env), stdio);
		return buffer.stdout.toString();
	}

	private getParamsForExec(
		command: string,
		env: Record<string, string> = {}
	): [string, string[], Record<string, string>] {
		const node = process.execPath;
		const [bin, args] = this.extractBinFromArgs(command);
		switch (bin) {
			case 'node':
				return [`${node} ${args}`, [], env];
			case 'yarn':
			case 'npm':
				return [`${node} ${this.which(bin)} ${args}`, [], env];
			default:
				return [command, [], env];
		}
	}

	private callBinWithArgs(
		bin: string,
		args: string[] = [],
		env: Record<string, string> = {},
		stdio: StdioOptions = ['inherit', 'inherit', 'pipe']
	): SpawnSyncReturns<Buffer> {
		core.notice('Running command...');
		core.notice(`bin: ${bin}`);
		core.notice(`args: ${args.join(', ')}`);
		const buffer = child_process.spawnSync(bin, args, {
			shell: true,
			stdio: stdio,
			cwd: this.cwd,
			env: { ...process.env, ...env },
			argv0: process.execArgv.join(' '),
		});
		if (buffer.status !== 0) {
			const msg = [
				`Failed to execute command!`,
				`bin: ${bin}`,
				`args: ${args.join(', ')}`,
				`env: ${JSON.stringify(env, undefined, 2)}`,
				'stderr:',
				buffer.stderr.toString(),
			] as const;
			core.setFailed(msg.join('\n'));
		}
		return buffer;
	}

	private which(bin: string): string {
		return child_process.execSync(`which ${bin}`).toString().trim();
	}

	private extractBinFromArgs(command: string): [string, string] {
		const bin = command.split(' ', 1)[0];
		if (!bin || bin.length < 1) {
			core.setFailed(`Failed to extract bin from command: ${command}`);
		}
		return [bin, command.replace(bin, '')];
	}
}

export { ExecSync };
