import { absPath, command, cwd, log, error, errorForSpawnSync } from './utilities';
import child_process from 'node:child_process';
import fs from 'node:fs';

// LATER: refactor to use SpawnSync.ts for improved error handling
class Tar {
	private isInstalled(): boolean {
		return command('tar');
	}

	/**
	 * @param files Files to be tarballed
	 * @param tarball Path to the (newly) created tarball
	 * @returns Absolute path to tarball file or `false` on failure
	 */
	public create(files: string | string[], tarball?: string): string | false {
		if (!this.isInstalled()) {
			return false;
		}

		const inputs = typeof files === 'string' ? [files] : files;

		for (const i of inputs) {
			if (!fs.existsSync(i)) {
				error(`Given tar input '${i}' does not exist!`);
				return false;
			}
		}

		const output = this.getTarballPath(files, tarball);

		if (!output) {
			return false;
		}

		if (fs.existsSync(output)) {
			error(`Output path for tarball already exists: '${output}' !`);
			return false;
		}

		const command = child_process.spawnSync('tar', ['--create', '--verbose', '--file', output, ...inputs], {
			stdio: 'pipe',
			encoding: 'utf-8',
		});

		log(command.stdout);

		if (command.status !== 0) {
			errorForSpawnSync(command, 'Could not create tarball!');
			return false;
		}

		return output;
	}

	private getTarballPath(files: string | string[], archive?: string): string | false {
		if (archive && archive.length === 0) {
			error('Given empty string to tar output path!');
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
			error('When supplying an array of files to tar, need to explicitly set archive file name!');
			return false;
		}

		error(
			`Tar received unsupported data type for argument 'files': ${typeof files}`,
			'Only supported: string, array!'
		);

		return false;
	}

	/**
	 * @param tarball Path to tarball
	 * @param directory Specify output directory (optional, see --directory)
	 * @returns Absolute path to extraction path or `false` on failure
	 */
	public extract(tarball: string, directory?: string): string | false {
		if (!this.isInstalled()) {
			return false;
		}

		const input = absPath(tarball);
		const output = directory ?? cwd();

		if (!fs.existsSync(input)) {
			error(`Did not find given tarball archive '${input}'!`);
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

		if (command.status === 0) {
			log(command.stdout);
		}

		if (command.status !== 0) {
			errorForSpawnSync(command, `Failed to extract tarball '${input}'!`);
			return false;
		}

		return output;
	}
}

export { Tar };
