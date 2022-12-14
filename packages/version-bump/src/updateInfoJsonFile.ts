import { readFile, writeFile } from '@eventespresso-actions/io';

import type { InfoJson } from './types';

export async function updateInfoJsonFile(
	newVersion: string,
	infoJsonFile: string,
	updateInfoJson: boolean
): Promise<InfoJson> {
	// read info.json file contents
	let infoJsonContent = await readFile(infoJsonFile, { encoding: 'utf8' });
	infoJsonContent = infoJsonContent.toString().trim();
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
