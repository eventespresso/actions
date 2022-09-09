import * as core from '@actions/core';

const owner = core.getInput('owner', { required: true });
const repo = core.getInput('repo', { required: true });
const token = core.getInput('token', { required: true });
export const pr = Number(core.getInput('prNumber', { required: true }));

// eslint-disable-next-line no-console
console.log('%c organization', 'color: LimeGreen;', owner);
// eslint-disable-next-line no-console
console.log('%c repository', 'color: Yellow;', repo);
// eslint-disable-next-line no-console
console.log('%c pull request #', 'color: HotPink;', pr);

const headers = {
	'Content-Type': 'application/json',
	'Authorization': `bearer ${token}`,
};
export const gqlVariables = { owner, repo, headers };
