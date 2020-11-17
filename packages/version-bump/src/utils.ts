import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';

export type BumpType = 'major' | 'minor' | 'patch' | 'release_type' | 'build';

export type ReleaseType = 'alpha' | 'beta' | 'decaf' | 'rc' | 'p';

export interface Input {
	infoJsonFile: string;
	mainFile: string;
	readmeFile: string;
	value?: string;
	type: BumpType;
}

export const bumpTypes: Array<BumpType> = ['major', 'minor', 'patch', 'release_type', 'build'];

/**
 * Retrieve the action inputs.
 */
export function getInput(): Input {
	const infoJsonFile = core.getInput('info-json-file', { required: true });
	const mainFile = core.getInput('main-file', { required: true });
	const readmeFile = core.getInput('readme-file', { required: true });
	const type = core.getInput('type', { required: true }) as BumpType;
	const value = core.getInput('value');

	if (!io.existsSync(mainFile)) {
		throw new Error('Main file does not exist.');
	}
	if (!io.existsSync(infoJsonFile)) {
		throw new Error('info.json file does not exist.');
	}
	if (!io.existsSync(readmeFile)) {
		throw new Error('readme.txt file does not exist.');
	}
	if (!bumpTypes.includes(type)) {
		throw new Error(`Unknown bump type - ${type}`);
	}

	return {
		infoJsonFile,
		mainFile,
		readmeFile,
		type,
		value,
	};
}

export const MAIN_FILE_VERSION_REGEX = /[\s\t/*#@]*Version:\s*(?<version>\S*)/i;

export const MAIN_FILE_PLUGIN_URI_REGEX = /[\s\t/*#@]*Plugin URI:\s*(?<plugin_uri>\S+)/i;

export const MAIN_FILE_PLUGIN_NAME_REGEX = /[\s\t/*#@]*Plugin Name:\s*(?<plugin_name>.+)/i;

export const README_FILE_STABLE_TAG_REGEX = /[\s\t/*#@]*Stable tag:\s*(?<stable_tag>\S+)/i;

/**
 * The regex reperesenting the version schema used by EE.
 *
 * MAJOR    ([0-9]+)                 MUST match & capture a number
 * DOT      \.                       MUST match a period
 * MINOR    ([0-9]+)                 MUST match & capture a number
 * DOT      \.                       MUST match a period
 * PATCH    ([0-9]+)                 MUST match & capture a number
 * DOT      \.?                      maybe match a period
 * RELEASE  (alpha|beta|rc|p|decaf)* maybe match one of values in brackets
 * DOT      \.?                      maybe match a period
 * BUILD    ([0-9]*)                 maybe match & capture a number
 * @see: https://regex101.com/r/5nSgf3/1/
 */
export const EE_VERSION_REGEX = /^(?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)\.?(?<releaseType>alpha|beta|rc|p|decaf)*\.?(?<build>[0-9]*)$/;

export const DEFAULT_VERSION_PARTS = {
	major: 0,
	minor: 0,
	patch: 0,
	releaseType: 'rc',
	build: 0,
};
