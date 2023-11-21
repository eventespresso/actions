import { InputFactory } from './InputFactory';
import child_process, { type SpawnSyncReturns, type SpawnSyncOptionsWithStringEncoding } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import zxcvbn from 'zxcvbn';
import * as core from '@actions/core';

class GPG {
	private readonly groupName: string = 'GPG';

	constructor(private readonly inputs: InputFactory) {}

	private isInstalled(): boolean {
		const bin = 'command';
		const args = ['-v', 'gpg'] as const;
		const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', encoding: 'utf-8', shell: true };
		const command = child_process.spawnSync(bin, args, options);
		if (command.status !== 0) {
			const msg = 'Did not find GPG binary!';
			this.logSpawnSyncError(command, msg);
			return false;
		}
		return true;
	}

	private logSpawnSyncError(command: SpawnSyncReturns<string | Buffer>, message?: string): void {
		core.startGroup(this.groupName);
		if (message) {
			core.error(message);
		}
		core.error('Stderr: ' + command.stderr);
		core.error('Signal: ' + command.signal);
		core.error('Status: ' + command.status);
		if (command.error) {
			core.error('Error: ' + command.error.message);
		}
		core.endGroup();
	}

	/**
	 * @param source Path to encrypted GPG file
	 * @param target Where to saved decrypted file to (defaults to source minus '.gpg' part)
	 */
	public decrypt(source: string, target?: string): boolean {
		if (!this.isInstalled()) {
			return false;
		}
		const password = this.getPassword();
		if (!password) {
			return false;
		}
		const input = this.getPath(source);
		if (!input) {
			return false;
		}
		const output = target ? this.normalizePath(target) : input.replace('.gpg', '');
		if (fs.existsSync(output)) {
			core.startGroup(this.groupName);
			core.error('Cannot decrypt GPG file in-place!');
			core.error(`Output path already exists: '${output}' !`);
			core.endGroup();
			return false;
		}
		const args = ['--batch', '--decrypt', '--passphrase-fd', '0', '--output', output, input] as const;
		const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', input: password, encoding: 'utf-8' };
		const gpg = child_process.spawnSync('gpg', args, options);
		if (gpg.status !== 0) {
			const msg = `Failed to decrypt GPG file: '${input}' !`;
			this.logSpawnSyncError(gpg, msg);
			return false;
		}
		return true;
	}

	/**
	 * @param source Path to file (NOT folders) which require encryption
	 * @param target Where to save the encrypted file (defaults to 'source.gpg')
	 */
	public encrypt(source: string, target?: string): boolean {
		if (!this.isInstalled()) {
			return false;
		}
		const password = this.getPassword();
		if (!password) {
			return false;
		}
		const cipher = this.getCipher();
		if (!cipher) {
			return false;
		}
		const input = this.getPath(source);
		if (!input) {
			return false;
		}
		const output = target ? this.normalizePath(target) : input + '.gpg';
		const args = [
			'--batch',
			'--symmetric',
			'--passphrase-fd',
			'0',
			'--cipher-algo',
			cipher,
			'--output',
			output,
			input,
		] as const;
		const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', input: password, encoding: 'utf-8' };
		const gpg = child_process.spawnSync('gpg', args, options);
		if (gpg.status !== 0) {
			const msg = 'GPG encryption has failed!';
			this.logSpawnSyncError(gpg, msg);
			return false;
		}
		return true;
	}

	private getPath(input: string): string | false {
		const absPath = this.normalizePath(input);
		if (!this.checkPath(absPath)) {
			core.startGroup(this.groupName);
			core.error('Given input path does not exist!');
			core.error('Raw input: ' + input);
			core.error('Absolute path: ' + absPath);
			core.endGroup();
			return false;
		}
		return absPath;
	}

	private checkPath(path: string): boolean {
		if (!fs.existsSync(path)) {
			core.startGroup(this.groupName);
			core.error(`Given path does not exist: '${path}' !`);
			core.endGroup();
			return false;
		}
		return true;
	}

	private normalizePath(source: string): string {
		if (path.isAbsolute(source)) {
			return source;
		}
		return path.resolve(__dirname, source);
	}

	private getPassword(): string | false {
		const password = this.inputs.gpgPassword();
		if (password.length === 0) {
			core.startGroup(this.groupName);
			core.error(`Missing value for input 'password' !`);
			core.endGroup();
			return false;
		}
		const strength = zxcvbn(password);
		if (strength.score < 3) {
			core.startGroup(this.groupName);
			strength.feedback.suggestions.forEach((s) => core.notice(s));
			core.warning(strength.feedback.warning);
			core.endGroup();
			return false;
		}
		return password;
	}

	private getCipher(): string | false {
		const targetCipher = this.inputs.gpgCipher().toUpperCase();
		const supportedCiphers = this.getSupportedCiphers();

		if (!supportedCiphers) {
			return false;
		}

		if (!supportedCiphers.includes(targetCipher)) {
			core.startGroup(this.groupName);
			core.error(`Unsupported GPG cipher: ${targetCipher}`);
			core.notice(`Supported GPG ciphers: ${supportedCiphers.join(', ')}`);
			core.endGroup();
			return false;
		}

		return targetCipher;
	}

	private getSupportedCiphers(): string[] | false {
		const gpg = child_process.spawnSync('gpg', ['--version'], { stdio: 'pipe', encoding: 'utf-8' });

		if (gpg.status !== 0) {
			const msg = 'Failed to get available GPG ciphers!';
			this.logSpawnSyncError(gpg, msg);
			return false;
		}

		const stdoutArray = gpg.stdout.split('\n').filter((s) => s.length > 0);

		const ciphersIndex = stdoutArray.findIndex((s) => s.startsWith('Cipher: '));

		if (!stdoutArray[ciphersIndex] || !stdoutArray[ciphersIndex + 1]) {
			core.startGroup(this.groupName);
			core.error('Internal error! Unable to parse available GPG ciphers! (array index error)');
			core.endGroup();
			return false;
		}

		const ciphersString = stdoutArray[ciphersIndex] + ' ' + stdoutArray[ciphersIndex + 1].trim();

		const ciphersArray = ciphersString
			.replace('Cipher:', '')
			.trim()
			.split(',')
			.map((s) => s.trim());

		return ciphersArray;
	}
}

export { GPG };
