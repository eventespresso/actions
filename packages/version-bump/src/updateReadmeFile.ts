import { readFile, writeFile } from '@eventespresso-actions/io';
import { README_FILE_STABLE_TAG_REGEX } from './utils';

export async function updateReadmeFile(newVersion: string, readmeFile: string): Promise<void> {
	// get readme.txt file contents.
	let readmeContents = await readFile(readmeFile, { encoding: 'utf8' });
	readmeContents = readmeContents.toString().trim();
	// replace stable tag in readme.txt
	readmeContents = readmeContents.replace(
		README_FILE_STABLE_TAG_REGEX,
		// `match` is like "Stable tag: 4.10.4.decaf"
		// `p1` is the first and only capturing group like "4.10.4.decaf"
		(match, p1) => match.replace(p1, newVersion)
	);
	// now save back to readme.txt
	await writeFile(readmeFile, readmeContents, { encoding: 'utf8' });
}
