import * as core from '@actions/core';
import { filter, map } from 'ramda';
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
	const { infoJsonFile, mainFile, readmeFile, releaseType: releaseTypeInput, type, value } = getInput();

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

		// remove empty matches from groups to avoid them overriding defaults
		const nonEmptyVersionParts = filter(Boolean, versionPartsMatch?.groups);

		// build version parts by setting defaults
		const versionParts = { ...DEFAULT_VERSION_PARTS, ...nonEmptyVersionParts };

		// prefer releaseType from inputs or
		// extract `releaseType` from the parts as it's the only non-numeric part
		let releaseType = releaseTypeInput || versionParts.releaseType;

		// make sure the numeric parts of the version are numbers
		let { major, minor, patch, build } = map(Number, versionParts);

		switch (type) {
			case 'major':
				// either the value passed explicitly to reset build number or an incremented value
				major = value || ++major;
				// both minor, patch and build numbers reset to zero
				minor = 0;
				patch = 0;
				build = 0;

				updateInfoJson = true;
				break;

			case 'minor':
				minor = value || ++minor;
				// patch and build reset to zero
				patch = 0;
				build = 0;

				updateInfoJson = true;
				break;

			case 'patch':
				patch = value || ++patch;
				build = 0;

				updateInfoJson = true;
				break;

			case 'build':
				build = value || ++build;
				// to use build number there must be a release type.
				// if none is present or supplied, use `rc` by default
				releaseType = releaseType || 'rc';
				break;

			case 'release_type':
				releaseType = value || releaseType || 'rc';
				break;
		}

		let newVersion = `${major}.${minor}.${patch}`;

		// add releaseType if not empty
		if (releaseType) {
			newVersion += `.${releaseType}`;
		}

		// add valid build number for alpha, beta, or release candidate versions
		if (build > 0 && ['alpha', 'beta', 'rc'].includes(releaseType)) {
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
		if (releaseType === 'decaf') {
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
		}

		// now finally save the main file contents
		io.writeFileSync(mainFile, mainFileContents, { encoding: 'utf8' });

		// set the output
		core.setOutput('new-version', newVersion);
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
