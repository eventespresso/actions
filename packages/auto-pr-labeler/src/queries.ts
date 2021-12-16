import type { LabelsQueryResponse, PullRequestQueryResponse } from './types';
import { gqlVariables } from './utils';
import { graphql } from '@octokit/graphql';

export const getLabels = (): Promise<LabelsQueryResponse> => {
	return graphql(
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

export const getPullRequest = (pr: number): Promise<PullRequestQueryResponse> => {
	return graphql(
		`
			query ($pr: Int!, $owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					pullRequest(number: $pr) {
						id
						labels(first: 10) {
							nodes {
								name
							}
						}
						number
						reviewDecision
						state
						closingIssuesReferences(first: 10) {
							nodes {
								id
								number
							}
						}
					}
				}
			}
		`,
		{ pr, ...gqlVariables }
	);
};
