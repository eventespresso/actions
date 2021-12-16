import * as core from '@actions/core';

const ownerRepo = core.getInput('ownerRepo', { required: true });
// eslint-disable-next-line no-console
console.log('%c ownerRepo', 'color: LimeGreen;', ownerRepo);
const ownerRepoArray = ownerRepo.split('/');
const owner = ownerRepoArray[0];
const repo = ownerRepoArray[1];
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
	authorization: `Bearer ${token}`,
};

export const gqlVariables = { owner, repo, headers };
