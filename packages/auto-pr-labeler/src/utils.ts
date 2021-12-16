import * as core from '@actions/core';

const owner = core.getInput('org', { required: true });
const repo = core.getInput('repo', { required: true });
const token = core.getInput('token', { required: true });

// eslint-disable-next-line no-console
console.log('%c organization', 'color: LimeGreen;', owner);
// eslint-disable-next-line no-console
console.log('%c repository', 'color: Yellow;', repo);

const headers = {
	'Content-Type': 'application/json',
	authorization: `Bearer ${token}`,
};

export const gqlVariables = { owner, repo, headers };
