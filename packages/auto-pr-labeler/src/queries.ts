import type { LabelsQueryResponse, PullRequestQueryResponse } from './types';
import { graphqlWithAuth } from './utils';

export const getLabels = async (): Promise<LabelsQueryResponse> => {
	return await graphqlWithAuth(
		`
		query ($owner: String!, $repo: String!) {
			repository(name: $repo, owner: $owner) {
				labels(first: 100, orderBy: {direction:ASC, field: NAME}) {
					nodes {
					name
					id
					}
				}
			}
		}
	`
	);
};

export const getPullRequest = async (pr: number): Promise<PullRequestQueryResponse> => {
	return await graphqlWithAuth(
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
		{ pr }
	);
};
