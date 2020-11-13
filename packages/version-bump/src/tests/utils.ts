export const getMockedFileContents = (path: string, version?: string): string => {
	switch (path) {
		case 'main-file.php':
			return `/*
            Plugin Name:Event Espresso
            Plugin URI: some-uri
            Version: ${version || '4.10.9.rc.011'}
            Author: Event Espresso
            Text Domain: event_espresso
            */`;
		case 'info.json':
			return `{
                    "versionFile": "espresso.php",
                    "wpOrgRelease": "${version || '4.10.8.p'}",
                    "wpOrgPluginName": "Event Espresso 4 Decaf",
                    "wpOrgPluginUrl": "https:\\/\\/eventespresso.com\\/pricing\\/?ee_ver=ee4&utm_source=ee4_decaf_plugin_admin&utm_medium=link&utm_campaign=wordpress_plugins_page&utm_content=support_link",
                    "name": "Event Espresso Core"
                }`;
		case 'readme.txt':
			return `Requires at least: 4.5
            Requires PHP: 5.4
            Tested up to: 5.4
            Stable tag: ${version || '4.10.4.decaf'}
            License: GPL2`;
	}
	return '';
};
