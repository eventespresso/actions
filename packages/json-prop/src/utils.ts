import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';

export interface Input {
	filePath: string;
	outputAsJson?: boolean;
	propPath: string;
}

/**
 * Retrieve the action inputs.
 */
export function getInput(): Input {
	const filePath = core.getInput('file-path', { required: true });
	const propPath = core.getInput('prop-path', { required: true });
	const outputAsJson = Boolean(core.getInput('output-as-json'));

	if (!io.existsSync(filePath)) {
		throw new Error('File does not exist.');
	}

	return {
		filePath,
		outputAsJson,
		propPath,
	};
}
