import { graphql } from '@octokit/graphql';

import { gqlVariables } from './utils';
import type { LabelsQueryResponse, PullRequestQueryResponse } from './types';

export const getLabels = async (): Promise<LabelsQueryResponse> => {
	return await graphql(
		`
			query ($owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					labels(first: 100, orderBy: { direction: ASC, field: NAME }) {
						nodes {
							name
							id
						}
					}
				}
			}
		`,
		gqlVariables
	);
};

export const getPullRequest = async (pr: number): Promise<PullRequestQueryResponse> => {
	return await graphql(
		`
			query ($pr: Int!, $owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					pullRequest(number: $pr) {
						id
						labels(first: 100) {
							nodes {
								id
								name
							}
						}
						number
						reviewDecision
						state
						closingIssuesReferences(first: 100) {
							nodes {
								id
								number
								title
							}
							totalCount
						}
						reviewRequests(first: 100) {
							totalCount
						}
						assignees(first: 10) {
							nodes {
								login
								id
							}
						}
					}
				}
			}
		`,
		{ pr, ...gqlVariables }
	);
};
