import { InputFactory } from './InputFactory';
import child_process, { type SpawnSyncOptionsWithStringEncoding } from 'node:child_process';
import fs from 'node:fs';
import zxcvbn from 'zxcvbn';
import * as core from '@actions/core';
import { absPath, command, logSpawnSyncError } from './utilities';

class GPG {
	private readonly groupName: string = 'GPG';

	constructor(private readonly inputs: InputFactory) {}

	private isInstalled(): boolean {
		return command('gpg');
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
		const output = target ? absPath(target) : input.replace('.gpg', '');
		if (fs.existsSync(output)) {
			core.startGroup(this.groupName);
			core.error('Cannot decrypt GPG file in-place!');
			core.error(`Output path already exists: '${output}' !`);
			core.endGroup();
			return false;
		}
		const args = ['--batch', '--decrypt', '--passphrase-fd', '0', '--output', output, input] as const;
		const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', input: password, encoding: 'utf-8' };
		const command = child_process.spawnSync('gpg', args, options);
		console.log(command.stdout);
		if (command.status !== 0) {
			const message = `Failed to decrypt GPG file: '${input}' !`;
			logSpawnSyncError({ command, message, group: this.groupName });
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
		const output = target ? absPath(target) : input + '.gpg';
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
		const command = child_process.spawnSync('gpg', args, options);
		console.log(command.stdout);
		if (command.status !== 0) {
			const message = 'GPG encryption has failed!';
			logSpawnSyncError({ command, message, group: this.groupName });
			return false;
		}
		return true;
	}

	private getPath(input: string): string | false {
		const p = absPath(input);
		if (!this.checkPath(p)) {
			core.startGroup(this.groupName);
			core.error('Given input path does not exist!');
			core.error('Raw input: ' + input);
			core.error('Absolute path: ' + p);
			core.endGroup();
			return false;
		}
		return p;
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
		const command = child_process.spawnSync('gpg', ['--version'], { stdio: 'pipe', encoding: 'utf-8' });

		console.log(command.stdout);

		if (command.status !== 0) {
			const message = 'Failed to get available GPG ciphers!';
			logSpawnSyncError({ command, message, group: this.groupName });
			return false;
		}

		const stdoutArray = command.stdout.split('\n').filter((s) => s.length > 0);

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
