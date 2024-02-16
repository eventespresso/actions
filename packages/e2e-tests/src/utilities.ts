import path from 'node:path';
import process from 'node:process';
import * as core from '@actions/core';
import child_process, { type SpawnSyncReturns, type SpawnSyncOptionsWithStringEncoding } from 'node:child_process';

/**
 * Check if the given binary is installed
 * @link https://askubuntu.com/questions/512770/what-is-the-bash-command-command
 * @param binary Absolute path to a binary file
 * @param group GitHub notice group (optional)
 * @returns
 */
export function command(binary: string): boolean {
	const bin = 'command';
	const args = ['-v', binary] as const;
	const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', encoding: 'utf-8', shell: true };
	const command = child_process.spawnSync(bin, args, options);
	if (command.status !== 0) {
		error(`Did not find installed binary for '${binary}'!`);
		return false;
	}
	return true;
}

type NoticeType = keyof Pick<typeof core, 'notice' | 'info' | 'warning' | 'error' | 'debug'>;

type NoticeOptions = { type?: NoticeType; group?: string };

/**
 * Create a GitHub annotation
 * @link https://github.com/actions/toolkit/tree/main/packages/core#logging
 */
export function annotation(message: string | string[], options: NoticeOptions = { type: 'error' }): void {
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
	return path.resolve(cwd(), source);
}

/**
 * Return current working directory of the command line
 * @link https://stackoverflow.com/a/12239689/4343719
 */
export function cwd(): string {
	return process.cwd();
}

type LogType = keyof Pick<typeof console, 'error' | 'info' | 'log' | 'warn'>;

/**
 * Flatten given string or an array of strings using newline as a glue
 */
function string(string: string | string[]): string {
	return Array.isArray(string) ? string.join('\n') : string;
}

function _log(message: string | string[], type: LogType): void {
	console[type](string(message));
}

export function error(...message: string[]): void {
	_log(message, 'error');
}

/**
 * Alias for log()
 */
export function info(...message: string[]): void {
	_log(message, 'info');
}

export function log(...message: string[]): void {
	_log(message, 'log');
}

/**
 * Alias for error()
 */
export function warn(...message: string[]): void {
	_log(message, 'warn');
}

/**
 * Convert output of command() function to a log message (single string)
 */
function commandToString(command: SpawnSyncReturns<string | Buffer>): string {
	const array: string[] = [];
	const stderr = command.stderr.toString();
	if (stderr.length) {
		array.push('Stderr: ' + command.stderr.toString());
	}
	const stdout = command.stdout.toString();
	if (stdout.length) {
		array.push('Stdout: ' + stdout);
	}
	if (command.error) {
		array.push(command.error.name + ': ' + command.error.message);
	}
	if (command.signal) {
		array.push('Signal used to kill the subprocess: ' + command.signal.toString());
	}
	if (command.status) {
		array.push('Exit code of the subprocess: ' + command.status.toString());
	}
	return string(array);
}

export function errorForSpawnSync(spawnSync: SpawnSyncReturns<string | Buffer>, ...message: string[]): void {
	error(string(message), commandToString(spawnSync));
}

/**
 * Alias for logForSpawnSync()
 */
export function infoForSpawnSync(spawnSync: SpawnSyncReturns<string | Buffer>, ...message: string[]): void {
	info(string(message), commandToString(spawnSync));
}

export function logForSpawnSync(spawnSync: SpawnSyncReturns<string | Buffer>, ...message: string[]): void {
	log(string(message), commandToString(spawnSync));
}

/**
 * Alias for errorForSpawnSync()
 */
export function warnForSpawnSync(spawnSync: SpawnSyncReturns<string | Buffer>, message: string[]): void {
	warn(string(message), commandToString(spawnSync));
}
