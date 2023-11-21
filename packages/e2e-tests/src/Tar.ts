import { absPath, command, cwd, log, logSpawnSyncError } from './utilities';
import child_process from 'node:child_process';
import fs from 'node:fs';

class Tar {
	private readonly group: string = 'tar';

	private isInstalled(): boolean {
		return command('tar', this.group);
	}

	/**
	 * @param files Files to be tarballed
	 * @param tarball Path to the (newly) created tarball
	 */
	public create(files: string | string[], tarball?: string): boolean {
		if (!this.isInstalled()) {
			return false;
		}

		const inputs = typeof files === 'string' ? [files] : files;

		for (const i of inputs) {
			if (!fs.existsSync(i)) {
				log(`Given tar input '${i}' does not exist!`, { group: this.group });
				return false;
			}
		}

		const output = this.getTarballPath(files, tarball);

		if (!output) {
			return false;
		}

		if (fs.existsSync(output)) {
			log(`Output path for tarball already exists: '${output}' !`, { group: this.group });
			return false;
		}

		const command = child_process.spawnSync('tar', ['--create', '--verbose', '--file', output, ...inputs], {
			stdio: 'pipe',
			encoding: 'utf-8',
		});

		console.log(command.stdout);

		if (command.status !== 0) {
			logSpawnSyncError({ command, group: this.group, message: 'Could not create tarball!' });
			return false;
		}

		return true;
	}

	private getTarballPath(files: string | string[], archive?: string): string | false {
		if (archive && archive.length === 0) {
			log('Given empty string to tar output path!', { group: this.group });
			return false;
		}

		if (typeof files === 'string') {
			if (archive) {
				return absPath(archive);
			}
			if (!archive) {
				return files.replace(/\/$/, '') + '.tar';
			}
		}

		if (Array.isArray(files)) {
			if (archive) {
				return absPath(archive);
			}
			if (!archive) {
				log('When supplying an array of files to tar, need to explicitly set archive file name!', {
					group: this.group,
				});
				return false;
			}
		}

		log(
			`Tar received unsupported data type for argument 'files': ${typeof files} \nOnly supported: string, array!`,
			{ group: this.group }
		);
		return false;
	}

	/**
	 * @param tarball Path to tarball
	 * @param directory Specify output directory (optional, see --directory)
	 */
	public extract(tarball: string, directory?: string): boolean {
		if (!this.isInstalled()) {
			return false;
		}

		const input = absPath(tarball);
		const output = directory ?? cwd();

		if (!fs.existsSync(input)) {
			log(`Did not find given tarball archive '${input}'!`, { group: this.group });
			return false;
		}

		if (directory) {
			const parentAbs = absPath(directory);
			if (!fs.existsSync(parentAbs)) {
				fs.mkdirSync(parentAbs, { recursive: true });
			}
		}

		const command = child_process.spawnSync(
			'tar',
			['--extract', '--verbose', '--file', input, '--directory', output],
			{ stdio: 'pipe', encoding: 'utf-8' }
		);

		console.log(command.stdout);

		if (command.status !== 0) {
			logSpawnSyncError({ command, message: `Failed to extract tarball '${input}'!`, group: this.group });
			return false;
		}

		return true;
	}
}

export { Tar };
