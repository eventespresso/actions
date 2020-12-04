import * as core from '@actions/core';

export interface Input {
	paths: string;
}
/**
 * Retrieve the action inputs.
 */
export function getInput(): Input {
	const paths = core.getInput('paths', { required: true });

	return {
		paths,
	};
}
