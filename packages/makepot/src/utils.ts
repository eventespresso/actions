import * as core from '@actions/core';

export interface Input {
	exclude?: string;
	headers?: string;
	headersJsonFile?: string;
	include?: string;
	ignoreDomain?: boolean;
	packageName?: string;
	savePath: string;
	slug: string;
	textDomain?: string;
}
/**
 * Retrieve the action inputs.
 */
export function getInput(): Input {
	const exclude = core.getInput('exclude');
	const headers = core.getInput('headers');
	const include = core.getInput('include');
	const ignoreDomain = Boolean(core.getInput('ignore-domain'));
	const packageName = core.getInput('package-name');
	const savePath = core.getInput('save-path', { required: true });
	const slug = core.getInput('slug', { required: true });
	const textDomain = core.getInput('text-domain') || slug;
	const headersJsonFile = core.getInput('headers-json-file');

	return {
		exclude,
		headers,
		headersJsonFile,
		ignoreDomain,
		include,
		packageName,
		savePath,
		slug,
		textDomain,
	};
}
