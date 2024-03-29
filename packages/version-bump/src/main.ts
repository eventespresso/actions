import * as core from '@actions/core';
import { readFileSync, writeFileSync } from '@eventespresso-actions/io';
import { getVersionInfo } from './getVersionInfo';
import { handleDecafRelease } from './handleDecafRelease';
import { updateReadmeFile } from './updateReadmeFile';
import { MAIN_FILE_VERSION_REGEX } from './utils';

import type { BumpType, CustomValue, ReleaseType } from './types';

export async function run(
	mainFile: string,
	infoJsonFile: string,
	readmeFile: string,
	bumpType: BumpType,
	releaseTypeInput?: ReleaseType,
	customValue?: CustomValue
): Promise<void> {
	try {
		// read main file contents
		let mainFileContents = readFileSync(mainFile, { encoding: 'utf8' });
		mainFileContents = mainFileContents.toString().trim();
		// get the current version using regex
		const currentVersion = mainFileContents.match(MAIN_FILE_VERSION_REGEX)?.groups?.version;

		if (!currentVersion) {
			throw new Error(`Could not parse version string from main file. currentVersion: ${currentVersion}`);
		}

		const { releaseType, newVersion, updateInfoJson } = await getVersionInfo(
			currentVersion,
			releaseTypeInput,
			bumpType,
			customValue
		);

		// replace versions in main file with newVersion.
		mainFileContents = mainFileContents.replace(new RegExp(`${currentVersion}`, 'gi'), newVersion);
		console.log({ mainFileContents });

		// if version type is decaf then let's update extra values in main file and the readme.txt as well.
		if (releaseType === 'decaf') {
			mainFileContents = await handleDecafRelease(mainFileContents, newVersion, infoJsonFile, updateInfoJson);
			await updateReadmeFile(newVersion, readmeFile);
		}
		// now finally save the main file contents with newline added at end
		writeFileSync(mainFile, `${mainFileContents}\n`);
		// set the output
		core.setOutput('new-version', newVersion);
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
