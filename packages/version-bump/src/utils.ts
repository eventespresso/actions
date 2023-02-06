import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import type { BumpType, CustomValue, Input, ReleaseType, VersionParts } from './types';

export const bumpTypes: Array<BumpType> = ['major', 'minor', 'patch', 'build', 'custom'];

export const releaseTypes: Array<ReleaseType> = ['alpha', 'beta', 'decaf', 'rc', 'p'];

/**
 * Retrieve the action inputs.
 */
export function getInput(): Input {
	const bumpType = core.getInput('bump-type', { required: true }) as BumpType;
	const customValue = core.getInput('custom-value') as CustomValue;
	const infoJsonFile = core.getInput('info-json-file', { required: true });
	const mainFile = core.getInput('main-file', { required: true });
	const readmeFile = core.getInput('readme-file', { required: true });
	const releaseType = core.getInput('release-type') as ReleaseType;

	if (!io.existsSync(mainFile)) {
		throw new Error(`The following main file does not exist: ${mainFile}`);
	}
	if (mainFile.includes('espresso.php') && !io.existsSync(infoJsonFile)) {
		throw new Error(`The following info.json file does not exist: ${infoJsonFile}`);
	}
	if (mainFile.includes('espresso.php') && !io.existsSync(readmeFile)) {
		throw new Error(`The following readme.txt file does not exist: ${readmeFile}`);
	}
	if (!bumpTypes.includes(bumpType)) {
		throw new Error(`Unknown bump type: ${bumpType}`);
	}
	if (releaseType && !releaseTypes.includes(releaseType)) {
		throw new Error(`Unknown release type: ${releaseType}`);
	}

	return {
		infoJsonFile,
		mainFile,
		readmeFile,
		releaseType,
		bumpType,
		customValue,
	};
}

export const MAIN_FILE_VERSION_REGEX = /[\s\t/*#@]*Version:\s*(?<version>\S*)/i;

export const MAIN_FILE_PLUGIN_URI_REGEX = /[\s\t/*#@]*Plugin URI:\s*(?<plugin_uri>\S+)/i;

export const MAIN_FILE_PLUGIN_NAME_REGEX = /[\s\t/*#@]*Plugin Name:\s*(?<plugin_name>.+)/i;

export const README_FILE_STABLE_TAG_REGEX = /[\s\t/*#@]*Stable tag:\s*(?<stable_tag>\S+)/i;

/**
 * The regex reperesenting the version schema used by EE.
 *
 * MAJOR    ([0-9]+)                  MUST match & capture a number
 * DOT      \.                        MUST match a period
 * MINOR    ([0-9]+)                  MUST match & capture a number
 * DOT      \.                        MUST match a period
 * PATCH    ([0-9]+)                  MUST match & capture a number
 * RELEASE  \.(alpha|beta|rc|p|decaf) optionally match a dot and one of values in brackets
 * BUILD    \.([0-9]*)                optionally match a dot & capture a number
 * @see: https://regex101.com/r/5nSgf3/1/
 */
export const EE_VERSION_REGEX =
	/^(?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)(?:\.(?<releaseType>alpha|beta|rc|p|decaf))?(?:\.(?<build>[0-9]*))?$/;

export const DEFAULT_VERSION_PARTS: VersionParts = {
	major: 0,
	minor: 0,
	patch: 0,
	build: 0,
	releaseType: 'rc',
};
