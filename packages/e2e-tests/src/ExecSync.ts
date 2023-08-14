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
		const [arg0, args] = this.extractBinFromArgs(command);
		switch (arg0) {
			case 'node':
				return [`${node}`, args, env];
			case 'yarn':
			case 'npm':
				return [`${node}`, [this.which(arg0), ...args], env];
			default:
				return [arg0, args, env];
		}
	}

	private callBinWithArgs(
		bin: string,
		args: string[] = [],
		env: Record<string, string> = {},
		stdio: StdioOptions = ['inherit', 'inherit', 'pipe']
	): SpawnSyncReturns<Buffer> {
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

	private extractBinFromArgs(command: string): [string, string[]] {
		const [arg0, ...args] = command.split(' ');
		return [arg0, args];
	}
}

export { ExecSync };
