import path from 'node:path';
import * as core from '@actions/core';
import child_process, { type SpawnSyncReturns, type SpawnSyncOptionsWithStringEncoding } from 'node:child_process';

export function command(binary: string, group?: string): boolean {
	const bin = 'command';
	const args = ['-v', binary] as const;
	const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', encoding: 'utf-8', shell: true };
	const command = child_process.spawnSync(bin, args, options);
	if (command.status !== 0) {
		if (group) {
			core.startGroup(group);
		}
		core.error(`Did not find installed binary for '${binary}'!`);
		if (group) {
			core.endGroup();
		}
		return false;
	}
	return true;
}

export function logSpawnSyncError({
	command,
	group,
	message,
}: {
	group?: string;
	message?: string;
	command: SpawnSyncReturns<string | Buffer>;
}): void {
	if (group) {
		core.startGroup(group);
	}
	if (message) {
		core.error(message);
	}
	core.error('Stderr: ' + command.stderr);
	core.error('Signal: ' + command.signal);
	core.error('Status: ' + command.status);
	if (command.error) {
		core.error('Error: ' + command.error.message);
	}
	if (group) {
		core.endGroup();
	}
}

type LogType = keyof Pick<typeof core, 'notice' | 'info' | 'warning' | 'error' | 'debug'>;

type LogOptions = { type?: LogType; group?: string };

export function log(message: string | string[], options: LogOptions = { type: 'error' }): void {
	const type = options.type ?? 'error';
	const group = options.group;
	if (group) {
		core.startGroup(group);
	}
	if (typeof message === 'string') {
		core[type](message);
	}
	if (Array.isArray(message)) {
		message.forEach((m) => core[type](m));
	}
	if (group) {
		core.endGroup();
	}
}

export function absPath(source: string): string {
	if (path.isAbsolute(source)) {
		return source;
	}
	return path.resolve(__dirname, source);
}
