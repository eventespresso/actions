import * as core from '@actions/core';

import * as io from '@eventespresso-actions/io';

import { getInput } from './utils';

export async function run(): Promise<void> {
	const { paths } = getInput();

	try {
		const pathsArr = JSON.parse(paths);

		if (!Array.isArray(pathsArr)) {
			throw new Error(`An array of paths was not supplied.`);
		}

		await Promise.all(pathsArr.map((path) => io.rmRF(path)));
	} catch (error) {
		core.setFailed(error.message);
	}
}

export default run;
