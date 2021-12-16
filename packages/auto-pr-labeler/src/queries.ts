import * as core from '@actions/core';
import type { LabelsQueryResponse, PullRequestQueryResponse } from './types';
import { graphqlWithAuth } from './utils';

export const getLabels = async (): Promise<LabelsQueryResponse> => {
	try {
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
	} catch (error) {
		core.setFailed(error.message);
	}
};

export const getPullRequest = async (pr: number): Promise<PullRequestQueryResponse> => {
	try {
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
	} catch (error) {
		core.setFailed(error.message);
	}
};
