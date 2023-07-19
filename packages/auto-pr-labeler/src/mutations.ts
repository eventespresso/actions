import { graphql } from '@octokit/graphql';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';

import { gqlVariables } from './utils';

import type { ID, LabelsQueryResponse } from './types';

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
