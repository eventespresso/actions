import * as core from '@actions/core';

const eventPayload = require(process?.env?.GITHUB_EVENT_PATH);
const ownerRepo = require(process?.env?.GITHUB_REPOSITORY);
console.log('%c eventPayload?.owner', 'color: LimeGreen;', eventPayload?.owner);
console.log('%c eventPayload?.repo', 'color: LimeGreen;', eventPayload?.repo);
console.log('%c ownerRepo', 'color: LimeGreen;', ownerRepo);
const owner = core.getInput('owner', { required: true });
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
