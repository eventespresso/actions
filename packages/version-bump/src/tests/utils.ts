import { BumpType } from '../utils';

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
	outputVer?: string;
};

export const checkForDuplicateCases = (testCases: Array<Record<string, unknown>>): void => {
	const bucket = [];
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
		type: 'pre_release',
		inputVer: '4.10.9.rc.011',
		outputVer: '4.10.9.beta',
	},
	{
		type: 'pre_release',
		inputVer: '4.10.9.rc',
		outputVer: '4.10.9.beta',
	},
	{
		type: 'pre_release',
		inputVer: '4.10.9.beta',
		outputVer: '4.10.9.beta',
	},
	{
		type: 'pre_release',
		inputVer: '0.0.0',
		outputVer: '0.0.0.beta',
	},
	{
		type: 'decaf',
		inputVer: '4.10.9.rc.011',
		outputVer: '4.10.9.decaf',
	},
	{
		type: 'decaf',
		inputVer: '4.10.9.rc',
		outputVer: '4.10.9.decaf',
	},
	{
		type: 'decaf',
		inputVer: '4.10.9.beta',
		outputVer: '4.10.9.decaf',
	},
	{
		type: 'decaf',
		inputVer: '0.0.0',
		outputVer: '0.0.0.decaf',
	},
	{
		type: 'rc',
		inputVer: '4.10.9.rc.011',
		// only build shoud be incremented
		outputVer: '4.10.9.rc.012',
	},
	{
		type: 'rc',
		inputVer: '4.10.9.rc',
		// patch shoud be incremented and build set to first
		outputVer: '4.10.10.rc.001',
	},
	{
		type: 'rc',
		inputVer: '4.10.9.beta',
		// patch shoud be incremented and build set to first
		outputVer: '4.10.10.rc.001',
	},
	{
		type: 'rc',
		inputVer: '0.0.0',
		// patch shoud be incremented and build set to first
		outputVer: '0.0.1.rc.001',
	},
	{
		type: 'rc',
		inputVer: '4.10.9.beta.011',
		// only build shoud be incremented
		outputVer: '4.10.9.rc.012',
	},
	{
		type: 'alpha',
		inputVer: '4.10.9.rc.011',
		// only build shoud be incremented
		outputVer: '4.10.9.alpha.012',
	},
	{
		type: 'alpha',
		inputVer: '4.10.9.rc',
		// patch shoud be incremented and build set to first
		outputVer: '4.10.10.alpha.001',
	},
	{
		type: 'alpha',
		inputVer: '4.10.9.beta',
		// patch shoud be incremented and build set to first
		outputVer: '4.10.10.alpha.001',
	},
	{
		type: 'alpha',
		inputVer: '0.0.0',
		// patch shoud be incremented and build set to first
		outputVer: '0.0.1.alpha.001',
	},
	{
		type: 'beta',
		inputVer: '4.10.9.rc.011',
		// only build shoud be incremented
		outputVer: '4.10.9.beta.012',
	},
	{
		type: 'beta',
		inputVer: '4.10.9.rc',
		// patch shoud be incremented and build set to first
		outputVer: '4.10.10.beta.001',
	},
	{
		type: 'beta',
		inputVer: '4.10.9.beta',
		// patch shoud be incremented and build set to first
		outputVer: '4.10.10.beta.001',
	},
	{
		type: 'beta',
		inputVer: '0.0.0',
		// patch shoud be incremented and build set to first
		outputVer: '0.0.1.beta.001',
	},
	{
		type: 'minor',
		inputVer: '4.10.9.rc.011',
		// minor is incremented and patch is set to 0
		outputVer: '4.11.0.p',
	},
	{
		type: 'minor',
		inputVer: '4.10.9.rc',
		outputVer: '4.11.0.p',
	},
	{
		type: 'minor',
		inputVer: '4.10.9.beta',
		outputVer: '4.11.0.p',
	},
	{
		type: 'minor',
		inputVer: '4.8.0.beta',
		// no change to patch when it's already 0
		outputVer: '4.9.0.p',
	},
	{
		type: 'minor',
		inputVer: '0.0.0',
		outputVer: '0.1.0.p',
	},
	{
		type: 'major',
		inputVer: '4.10.9.rc.011',
		// major is incremented and minor and patch are set to 0
		outputVer: '5.0.0.p',
	},
	{
		type: 'major',
		inputVer: '4.10.9.rc',
		outputVer: '5.0.0.p',
	},
	{
		type: 'major',
		inputVer: '4.10.9.beta',
		outputVer: '5.0.0.p',
	},
	{
		type: 'major',
		inputVer: '4.8.0.beta',
		// no change to patch when it's already 0
		outputVer: '5.0.0.p',
	},
	{
		type: 'major',
		inputVer: '4.0.8.beta',
		// no change to minor when it's already 0
		outputVer: '5.0.0.p',
	},
	{
		type: 'major',
		inputVer: '4.0.0.beta',
		// no change to minor and patch when already 0
		outputVer: '5.0.0.p',
	},
	{
		type: 'major',
		inputVer: '0.0.0',
		outputVer: '1.0.0.p',
	},
];
