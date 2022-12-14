import { updateInfoJsonFile } from './updateInfoJsonFile';
import { MAIN_FILE_PLUGIN_NAME_REGEX, MAIN_FILE_PLUGIN_URI_REGEX } from './utils';

export async function handleDecafRelease(
	mainFileContents: string,
	newVersion: string,
	infoJsonFile: string,
	updateInfoJson: boolean
): Promise<string> {
	// read info.json file contents and possibly update
	const infoJson = await updateInfoJsonFile(newVersion, infoJsonFile, updateInfoJson);
	// but we're also changing the plugin name and uri
	const pluginUri = mainFileContents.match(MAIN_FILE_PLUGIN_URI_REGEX)?.groups?.plugin_uri?.trim();
	const pluginName = mainFileContents.match(MAIN_FILE_PLUGIN_NAME_REGEX)?.groups?.plugin_name?.trim();

	if (pluginUri) {
		mainFileContents = mainFileContents.replace(pluginUri, infoJson.wpOrgPluginUrl);
	}
	if (pluginName) {
		mainFileContents = mainFileContents.replace(pluginName, infoJson.wpOrgPluginName);
	}
	return mainFileContents;
}
