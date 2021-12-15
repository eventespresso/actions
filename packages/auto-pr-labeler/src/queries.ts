import type { LabelsQueryResponse, PullRequestQueryResponse } from './types';
import { graphqlWithAuth } from './utils';

export const getLabels = async (org: string, repo: number, token: string): Promise<LabelsQueryResponse> => {
	return await graphqlWithAuth(token)(
		`
		query ($org: String!, $repo: String!) {
			repository(name: $repo, owner: $org) {
				labels(first: 100, orderBy: {direction:ASC, field: NAME}) {
					nodes {
					name
					id
					}
				}
			}
		}
	`,
		// ex: {"org": "eventespresso", "repo":"barista"}
		{ org, repo }
	);
};

export const getPullRequest = async (
	org: string,
	repo: string,
	pr: number,
	token: string
): Promise<PullRequestQueryResponse> => {
	return await graphqlWithAuth(token)(
		`
			query ($pr: Int!, $org: String!, $repo: String!) {
				repository(name: $repo, owner: $org) {
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
		// ex: {"org": "eventespresso", "repo":"barista", "pr":1098}
		{ org, repo, pr }
	);
};
