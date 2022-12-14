import * as core from '@actions/core';
import { readFile, writeFile } from '@eventespresso-actions/io';
import { getVersionInfo } from './getVersionInfo';
import { handleDecafRelease } from './handleDecafRelease';
import { BumpType, BumpValue, ReleaseType } from './types';
import { updateReadmeFile } from './updateReadmeFile';
import { MAIN_FILE_VERSION_REGEX } from './utils';

export async function run(
	mainFile: string,
	releaseTypeInput?: ReleaseType,
	type?: BumpType,
	value?: BumpValue
): Promise<void> {
	try {
		// read main file contents
		let mainFileContents = await readFile(mainFile, { encoding: 'utf8' });
		mainFileContents = mainFileContents.toString().trim();
		// get the current version using regex
		const currentVersion = mainFileContents.match(MAIN_FILE_VERSION_REGEX)?.groups?.version;

		if (!currentVersion) {
			throw new Error(`Could not parse version string from main file. currentVersion: ${currentVersion}`);
		}

		const { releaseType, newVersion, updateInfoJson } = await getVersionInfo(
			currentVersion,
			releaseTypeInput,
			type,
			value
		);

		// replace versions in main file with newVersion.
		mainFileContents = mainFileContents.replace(new RegExp(`${newVersion}`, 'gi'), newVersion);
		console.log({ mainFileContents });

		// if version type is decaf then let's update extra values in main file and the readme.txt as well.
		if (releaseType === 'decaf') {
			mainFileContents = await handleDecafRelease(mainFileContents, newVersion, updateInfoJson);
			await updateReadmeFile(newVersion);
		}
		// now finally save the main file contents with newline added at end
		await writeFile(mainFile, `${mainFileContents}\n`, { encoding: 'utf8' });
		// set the output
		core.setOutput('new-version', newVersion);
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
