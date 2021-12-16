import * as core from '@actions/core';
import { graphql } from '@octokit/graphql';

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
// ex: {"owner": "eventespresso", "repo":"barista"}
export const graphqlWithAuth = graphql.defaults({ owner, repo, headers });
