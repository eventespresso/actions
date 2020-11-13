import * as core from '@actions/core';

import * as io from '@eventespresso-actions/io';

import {
	DEFAULT_VERSION_PARTS,
	EE_VERSION_REGEX,
	MAIN_FILE_PLUGIN_NAME_REGEX,
	MAIN_FILE_PLUGIN_URI_REGEX,
	MAIN_FILE_VERSION_REGEX,
	README_FILE_STABLE_TAG_REGEX,
	getInput,
} from './utils';

export async function run(): Promise<void> {
	const { infoJsonFile, mainFile, readmeFile, releaseTypes, type } = getInput();

	let updateInfoJson = false;

	try {
		// read main file contents
		let mainFileContents = io.readFileSync(mainFile, { encoding: 'utf8' });
		// read info.json file contents
		const infoJson = JSON.parse(io.readFileSync(infoJsonFile, { encoding: 'utf8' }));
		// get the current version using regex
		const currentVersion = mainFileContents.match(MAIN_FILE_VERSION_REGEX)?.groups?.version;

		if (!currentVersion) {
			throw new Error('Could not parse version string from main file.');
		}

		const versionPartsMatch = currentVersion.match(EE_VERSION_REGEX);

		if (!versionPartsMatch?.groups) {
			throw new Error('Invalid version! Version does not match the pattern');
		}

		// build version parts by setting defaults
		const versionParts = { ...DEFAULT_VERSION_PARTS, ...versionPartsMatch?.groups };

		let { major, minor, patch, release, build } = versionParts;

		switch (type) {
			case 'pre_release':
			case 'decaf':
				// we're not bumping just replacing the `release` string
				release = releaseTypes[type];
				// reset build if not done so already
				build = 0;
				break;

			case 'rc':
			case 'alpha':
			case 'beta':
				// if build number is not set, then increment the patch
				if (build === 0) {
					patch++;
				}
				// set release type and increment build number
				release = type;
				// if build was not set, then 0 will be incremented to 1, and then set as '.001'
				build++;
				break;

			case 'minor':
				minor++;
				// patch and build reset to zero
				patch = 0;
				build = 0;
				release = releaseTypes.release;
				updateInfoJson = true;
				break;

			case 'major':
				major++;
				// both minor, patch and build numbers reset to zero
				minor = 0;
				patch = 0;
				build = 0;
				release = releaseTypes.release;
				updateInfoJson = true;
				break;
		}

		let newVersion = `${major}.${minor}.${patch}.${release}`;

		// add valid build number for alpha, beta, or release candidate versions
		if (build > 0 && (type === 'alpha' || type === 'beta' || release === 'rc')) {
			newVersion += `.${build.toString().padStart(3, '0')}`;
		}

		// replace versions in main file with newVersion.
		mainFileContents = mainFileContents.replace(currentVersion, newVersion);

		// update info.json, so decaf release get built off of this tag.
		if (updateInfoJson && infoJson) {
			infoJson.wpOrgRelease = newVersion;
			const infoJsonContents = JSON.stringify(infoJson, null, 2);
			// now save back to info.json
			io.writeFileSync(infoJsonFile, infoJsonContents, { encoding: 'utf8' });
		}

		// if version type is decaf then let's update extra values in main file and the readme.txt as well.
		if (type === 'decaf') {
			// but we're also changing the plugin name and uri
			const pluginUri = mainFileContents.match(MAIN_FILE_PLUGIN_URI_REGEX)?.groups?.plugin_uri?.trim();
			const pluginName = mainFileContents.match(MAIN_FILE_PLUGIN_NAME_REGEX)?.groups?.plugin_name?.trim();

			if (pluginUri) {
				mainFileContents = mainFileContents.replace(pluginUri, infoJson.wpOrgPluginUrl);
			}
			if (pluginName) {
				mainFileContents = mainFileContents.replace(pluginName, infoJson.wpOrgPluginName);
			}

			// get readme.txt file contents.
			let readmeContents = io.readFileSync(readmeFile, { encoding: 'utf8' });
			// replace stable tag in readme.txt
			readmeContents = readmeContents.replace(
				README_FILE_STABLE_TAG_REGEX,
				// `match` is like "Stable tag: 4.10.4.decaf"
				// `p1` is the first and only capturing group like "4.10.4.decaf"
				(match, p1) => match.replace(p1, newVersion)
			);
			// now save back to readme.txt
			io.writeFileSync(readmeFile, readmeContents, { encoding: 'utf8' });

			// set the output
			core.setOutput('new-version', newVersion);
		}

		// now finally save the main file contents
		io.writeFileSync(mainFile, mainFileContents, { encoding: 'utf8' });
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
