import * as core from '@actions/core';
import * as dotenv from 'dotenv';

dotenv.config();
const ownerRepo = process.env.GITHUB_REPOSITORY;

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require
const eventPayload = require(process.env.GITHUB_EVENT_PATH);
// eslint-disable-next-line no-console
console.log('%c eventPayload?.owner', 'color: LimeGreen;', eventPayload?.owner);
// eslint-disable-next-line no-console
console.log('%c eventPayload?.repo', 'color: LimeGreen;', eventPayload?.repo);
// eslint-disable-next-line no-console
console.log('%c ownerRepo', 'color: LimeGreen;', ownerRepo);
// const owner = core.getInput('owner', { required: true });
// const owner = core.getInput('owner', { required: true });
const token = core.getInput('token', { required: true });
// export const pr = Number(core.getInput('prNumber', { required: true }));
const owner = eventPayload?.owner;
const repo = eventPayload?.repo;
export const pr = Number(eventPayload.issue.number);

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
