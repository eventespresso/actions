import { BumpType, ReleaseType } from '../types';

export const getMockedFileContents = (path: string, version?: string): string => {
	switch (path) {
		case 'main-file.php':
			return `/*
            Plugin Name:Event Espresso
            Plugin URI: some-uri
            Version: ${version /*  || '4.10.9.rc.011' */}
            Author: Event Espresso
            Text Domain: event_espresso
            */`;
		case 'info.json':
			return `{
                    "versionFile": "espresso.php",
                    "wpOrgRelease": "${version /*  || '4.10.8.p' */}",
                    "wpOrgPluginName": "Event Espresso 4 Decaf",
                    "wpOrgPluginUrl": "https:\\/\\/eventespresso.com\\/pricing\\/?ee_ver=ee4&utm_source=ee4_decaf_plugin_admin&utm_medium=link&utm_campaign=wordpress_plugins_page&utm_content=support_link",
                    "name": "Event Espresso Core"
                }`;
		case 'readme.txt':
			return `Requires at least: 4.5
            Requires PHP: 5.4
            Tested up to: 5.4
            Stable tag: ${version /*  || '4.10.4.decaf' */}
            License: GPL2`;
	}
	return '';
};

type MainTestCase = {
	type: BumpType;
	inputVer: string;
	outputVer: string;
	releaseType?: ReleaseType;
	value?: string;
};

export const checkForDuplicateCases = (testCases: Array<Record<string, unknown>>): void => {
	const bucket: string[] = [];
	for (const testCase of testCases) {
		const key = Object.values(testCase).join(':');
		if (bucket.includes(key)) {
			throw new Error(`Duplicate test case found ${JSON.stringify(testCase, null, 2)}`);
		} else {
			bucket.push(key);
		}
	}
};

export const mainNormalTestCases: Array<MainTestCase> = [
	{
		type: 'major',
		inputVer: '4.10.9.rc.011',
		// major is incremented and minor and patch are set to 0
		outputVer: '5.0.0.rc',
	},
	{
		type: 'major',
		inputVer: '4.10.9.rc',
		outputVer: '5.0.0.rc',
	},
	{
		type: 'major',
		inputVer: '4.10.9.beta',
		outputVer: '5.0.0.beta',
	},
	{
		type: 'major',
		inputVer: '4.8.0.beta',
		// no change to patch when it's already 0
		outputVer: '5.0.0.beta',
	},
	{
		type: 'major',
		inputVer: '4.0.8.beta',
		// no change to minor when it's already 0
		outputVer: '5.0.0.beta',
	},
	{
		type: 'major',
		inputVer: '4.0.0.beta',
		// no change to minor and patch when already 0
		outputVer: '5.0.0.beta',
	},
	{
		type: 'major',
		inputVer: '0.0.0',
		outputVer: '1.0.0',
	},
	{
		type: 'major',
		inputVer: '0.0.0',
		outputVer: '5.0.0',
		// explicitly set the version
		value: '5',
	},
	{
		type: 'major',
		inputVer: '0.0.0',
		outputVer: '1.0.0.beta',
		// explicitly set the release type, when there is none
		releaseType: 'beta',
	},
	{
		type: 'major',
		inputVer: '4.0.0.beta',
		outputVer: '5.0.0.rc',
		// explicitly set the release type, when there is already one
		releaseType: 'rc',
	},
	{
		type: 'minor',
		inputVer: '4.10.9.rc.011',
		// minor is incremented and patch is set to 0
		outputVer: '4.11.0.rc',
	},
	{
		type: 'minor',
		inputVer: '4.10.9.rc',
		outputVer: '4.11.0.rc',
	},
	{
		type: 'minor',
		inputVer: '4.3.9.beta',
		outputVer: '4.4.0.beta',
	},
	{
		type: 'minor',
		inputVer: '4.8.0.beta',
		// no change to patch when it's already 0
		outputVer: '4.9.0.beta',
	},
	{
		type: 'minor',
		inputVer: '0.0.0',
		outputVer: '0.1.0',
	},
	{
		type: 'minor',
		inputVer: '5.3.1',
		outputVer: '5.5.0',
		// explicitly set the version
		value: '5',
	},
	{
		type: 'minor',
		inputVer: '0.0.0',
		outputVer: '0.1.0.beta',
		// explicitly set the release type, when there is none
		releaseType: 'beta',
	},
	{
		type: 'minor',
		inputVer: '4.4.0.beta',
		outputVer: '4.5.0.rc',
		// explicitly set the release type, when there is already one
		releaseType: 'rc',
	},
	{
		type: 'patch',
		inputVer: '4.10.9.rc.011',
		// only patch shoud be incremented and build stripped
		outputVer: '4.10.10.rc',
	},
	{
		type: 'patch',
		inputVer: '4.10.9.rc',
		// only patch shoud be incremented
		outputVer: '4.10.10.rc',
	},
	{
		type: 'patch',
		inputVer: '2.10.9.beta',
		// patch shoud be incremented
		outputVer: '2.10.10.beta',
	},
	{
		type: 'patch',
		inputVer: '0.0.0',
		// patch shoud be incremented
		outputVer: '0.0.1',
	},
	{
		type: 'patch',
		inputVer: '5.10.9.beta.011',
		// patch shoud be incremented and build should be stripped
		outputVer: '5.10.10.beta',
	},
	{
		type: 'patch',
		inputVer: '1.0.6',
		outputVer: '1.0.5',
		// explicitly set the version
		value: '5',
	},
	{
		type: 'patch',
		inputVer: '0.0.0',
		outputVer: '0.0.1.beta',
		// explicitly set the release type, when there is none
		releaseType: 'beta',
	},
	{
		type: 'patch',
		inputVer: '4.0.3.beta',
		outputVer: '4.0.4.rc',
		// explicitly set the release type, when there is already one
		releaseType: 'rc',
	},
	{
		type: 'release_type',
		inputVer: '3.10.9.rc.011',
		// no change
		outputVer: '3.10.9.rc.011',
	},
	{
		type: 'release_type',
		inputVer: '7.10.9.rc',
		outputVer: '7.10.9.beta',
		value: 'beta',
	},
	{
		type: 'release_type',
		inputVer: '4.10.9.rc',
		outputVer: '4.10.9.rc',
		value: 'rc',
	},
	{
		type: 'release_type',
		inputVer: '8.10.9.p',
		outputVer: '8.10.9.beta',
		value: 'beta',
	},
	{
		type: 'release_type',
		inputVer: '0.0.0',
		outputVer: '0.0.0.rc',
	},
	{
		type: 'release_type',
		inputVer: '4.10.9.p',
		outputVer: '4.10.9.alpha',
		value: 'alpha',
	},
	{
		type: 'release_type',
		inputVer: '4.10.8.rc.011',
		outputVer: '4.10.8.p',
		value: 'p',
	},
	{
		type: 'build',
		inputVer: '4.10.9.rc.011',
		// only build shoud be incremented
		outputVer: '4.10.9.rc.012',
	},
	{
		type: 'build',
		inputVer: '4.10.9.rc',
		// build should be set to first
		outputVer: '4.10.9.rc.001',
	},
	{
		type: 'build',
		inputVer: '4.10.2.beta',
		// build should be set to first
		outputVer: '4.10.2.beta.001',
	},
	{
		type: 'build',
		inputVer: '0.0.0',
		// build should be set to first and release type should be rc by default
		outputVer: '0.0.0.rc.001',
	},
	{
		type: 'build',
		inputVer: '4.11.9.beta.011',
		// build shoud be incremented and build should be stripped
		outputVer: '4.11.9.beta.012',
	},
	{
		type: 'build',
		inputVer: '2.4.0',
		outputVer: '2.4.0.rc.005',
		// explicitly set the version
		value: '005',
	},
];
