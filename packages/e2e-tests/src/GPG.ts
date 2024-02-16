import { InputFactory } from './InputFactory';
import { absPath, command, error, errorForSpawnSync, log } from './utilities';
import zxcvbn from 'zxcvbn';
import child_process, { type SpawnSyncOptionsWithStringEncoding } from 'node:child_process';
import fs from 'node:fs';

class GPG {
	constructor(private readonly inputs: InputFactory) {}

	private isInstalled(): boolean {
		return command('gpg');
	}

	/**
	 * @param source Path to encrypted GPG file
	 * @param target Where to saved decrypted file to (defaults to source minus '.gpg' part)
	 * @returns Absolute path to decrypted file or `false` on failure
	 */
	public decrypt(source: string, target?: string): string | false {
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
			error('Cannot decrypt GPG file in-place!', 'Output path already exists!', 'File path: ' + output);
			return false;
		}

		const args = ['--batch', '--decrypt', '--passphrase-fd', '0', '--output', output, input] as const;

		const options: SpawnSyncOptionsWithStringEncoding = { stdio: 'pipe', input: password, encoding: 'utf-8' };

		const command = child_process.spawnSync('gpg', args, options);
		log(command.stdout);

		if (command.status !== 0) {
			errorForSpawnSync(command, 'Failed to decrypt GPG file!', 'File path: ' + input);
			return false;
		}

		return output;
	}

	/**
	 * @param source Path to file (NOT folders) which require encryption
	 * @param target Where to save the encrypted file (defaults to 'source.gpg')
	 * @return Absolute path to encrypted file or `false` on failure
	 */
	public encrypt(source: string, target?: string): string | false {
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

		if (command.status === 0) {
			log(command.stdout);
		}

		if (command.status !== 0) {
			errorForSpawnSync(command, 'GPG encryption has failed!', 'File path: ' + source);
			return false;
		}

		return output;
	}

	private getPath(input: string): string | false {
		const p = absPath(input);
		if (!this.checkPath(p)) {
			error('Given input path does not exist!', 'Absolute path: ' + p);
			return false;
		}
		return p;
	}

	private checkPath(path: string): boolean {
		if (!fs.existsSync(path)) {
			error('Given path does not exist!', 'File path: ' + path);
			return false;
		}
		return true;
	}

	private getPassword(): string | false {
		const password = this.inputs.gpgPassword();

		if (password.length === 0) {
			error(`Missing value for input 'password' !`);
			return false;
		}

		const strength = zxcvbn(password);

		if (strength.score < 3) {
			error(strength.feedback.warning, ...strength.feedback.suggestions);
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
			error(`Unsupported GPG cipher: ${targetCipher}`, `Supported GPG ciphers: ${supportedCiphers.join(', ')}`);
			return false;
		}

		return targetCipher;
	}

	private getSupportedCiphers(): string[] | false {
		const command = child_process.spawnSync('gpg', ['--version'], { stdio: 'pipe', encoding: 'utf-8' });

		if (command.status === 0) {
			log(command.stdout);
		}

		if (command.status !== 0) {
			errorForSpawnSync(command, 'Failed to get available GPG ciphers!');
			return false;
		}

		const stdoutArray = command.stdout.split('\n').filter((s) => s.length > 0);

		const ciphersIndex = stdoutArray.findIndex((s) => s.startsWith('Cipher: '));

		if (!stdoutArray[ciphersIndex] || !stdoutArray[ciphersIndex + 1]) {
			error('Internal error! Unable to parse available GPG ciphers! (array index error)');
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
