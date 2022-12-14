import { readFile, writeFile } from '@actions/io';
import { getInput } from './utils';

import type { InfoJson } from './types';

export async function updateInfoJsonFile(newVersion: string, updateInfoJson: boolean): Promise<InfoJson> {
	const { infoJsonFile } = getInput();
	// read info.json file contents
	const infoJsonContent = await readFile(infoJsonFile, { encoding: 'utf8' });
	const infoJson = JSON.parse(infoJsonContent);
	// update info.json, so decaf release get built off of this tag.
	if (updateInfoJson && infoJson) {
		infoJson.wpOrgRelease = newVersion;
		const infoJsonContents = JSON.stringify(infoJson, null, 2);
		// now save back to info.json
		await writeFile(infoJsonFile, infoJsonContents, { encoding: 'utf8' });
	}
	return infoJson;
}
