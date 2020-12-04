import * as core from '@actions/core';
import { path } from 'ramda';

import * as io from '@eventespresso-actions/io';
import { toPath } from '@eventespresso-actions/utils';

import { getInput } from './utils';

export async function run(): Promise<void> {
	const { filePath, outputAsJson, propPath } = getInput();

	try {
		// read the JSOn file
		const obj = JSON.parse(io.readFileSync(filePath, { encoding: 'utf8' }));

		// get the value from the given path
		let propValue = path(toPath(propPath), obj);

		if (typeof propValue === 'undefined') {
			throw new Error(`Path ${propPath} does not exist in ${filePath}`);
		}

		if (outputAsJson) {
			propValue = JSON.stringify(propValue);
		}

		core.setOutput('value', propValue);
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
