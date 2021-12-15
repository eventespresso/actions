import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import { downloadUrl } from '@eventespresso-actions/utils';
import { exec } from '@actions/exec';
import { getInput } from './utils';

export async function run(): Promise<void> {
	const { exclude, headers, headersJsonFile, ignoreDomain, include, packageName, savePath, slug, textDomain } =
		getInput();

	try {
		//#region WP CLI setup
		core.startGroup('Setup WP-CLI');
		const wpcliPath = 'wp-cli.phar';
		// download WP CLI executable
		const error = await downloadUrl(
			'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar',
			wpcliPath
		);
		if (error) {
			throw new Error(error);
		}
		/**
		 * Make the file executable
		 * @see https://nodejs.org/api/fs.html#fs_fs_chmod_path_mode_callback
		 */
		await io.chmod(wpcliPath, 0o765);
		// move to path
		await exec('sudo mv', [wpcliPath, '/usr/local/bin/wp']);
		core.endGroup();
		//#endregion

		//#region Configuration
		const potPath = `${savePath}/${textDomain}.pot`;
		let potHeaders: string;

		if (headersJsonFile && io.existsSync(headersJsonFile)) {
			// JSON file may have spaces and new lines
			// we will parse it and stringify again to get rid of spaces and line breaks
			const headersObj = JSON.parse(io.readFileSync(headersJsonFile, { encoding: 'utf8' }));
			potHeaders = JSON.stringify(headersObj);
		} else {
			potHeaders = headers;
		}

		// command arguments
		const args = [
			`--slug=${slug}`,
			exclude && `--exclude=${exclude}`,
			potHeaders && `--headers=${potHeaders}`,
			ignoreDomain && '--ignore-domain',
			include && `--include=${include}`,
			packageName && `--package-name="${packageName}"`,
			textDomain && `--domain=${textDomain}`,
		].filter(Boolean);
		//#endregion

		//#region POT file generation
		core.startGroup('Generating POT File');
		await exec('wp i18n make-pot .', [potPath, ...args, `--allow-root`]);
		// temporary - output POT file contents
		core.info(io.readFileSync(potPath, { encoding: 'utf8' }));
		core.endGroup();
		//#endregion
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
