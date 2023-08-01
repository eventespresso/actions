import { graphql } from '@octokit/graphql';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';

import { gqlVariables } from './utils';

import type { AssigneesQueryResponse, ID, LabelsQueryResponse } from './types';

export const addAssigneesMutation = async (
	assignableId: ID,
	assigneeIds: Array<ID>
): Promise<GraphQlQueryResponse<AssigneesQueryResponse>> => {
	return await graphql(
		`
			mutation ($assignableId: ID!, $assigneeIds: [ID!]!) {
				addAssigneesToAssignable(input: { assignableId: $assignableId, assigneeIds: $assigneeIds }) {
					assignable {
						assignees(first: 10) {
							nodes {
								login
							}
						}
					}
				}
			}
		`,
		{ assigneeIds, assignableId, ...gqlVariables }
	);
};

export const addLabelsMutation = async (
	labelIds: Array<ID>,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	return await graphql(
		`
			mutation ($labelIds: [ID!]!, $labelableId: ID!) {
				addLabelsToLabelable(input: { labelIds: $labelIds, labelableId: $labelableId }) {
					labelable {
						labels(first: 10) {
							nodes {
								name
							}
						}
					}
				}
			}
		`,
		{ labelIds, labelableId, ...gqlVariables }
	);
};

export const removeLabelsMutation = async (
	labelIds: Array<ID>,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	return await graphql(
		`
			mutation ($labelIds: [ID!]!, $labelableId: ID!) {
				removeLabelsFromLabelable(input: { labelIds: $labelIds, labelableId: $labelableId }) {
					labelable {
						labels(first: 10) {
							nodes {
								id
								name
							}
						}
					}
				}
			}
		`,
		{ labelIds, labelableId, ...gqlVariables }
	);
};
