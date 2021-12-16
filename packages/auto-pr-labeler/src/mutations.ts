import type { LabelsQueryResponse, PullRequest } from './types';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';
import { gqlVariables } from './utils';
import { graphql } from '@octokit/graphql';
import { labels } from './labels';

const addLabelsMutation = `
			mutation {
				addLabelsToLabelable(
					input: {
						labelIds: labelIds,
						labelableId: labelableId
					}
				) {
					labelable {
						labels(first: 10) {
							nodes {
								name
							}
						}
					}
				}
			}
	`;

const removeLabelsMutation = `
			mutation {
				removeLabelsFromLabelable(
					input: {
						labelIds: labelIds,
						labelableId: labelableId
					}
				) {
					labelable {
						labels(first: 10) {
							nodes {
								name
							}
						}
					}
				}
			}
	`;

const assignLabelsAfterClose = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusInvalid];
	return graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterMerge = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCompleted];
	return graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterCreated = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusNew];
	return graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterReviewApproved = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusApproved];
	return graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterReviewChangesRequested = (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusPleaseFix];
	return graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterReviewRequested = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCodeReview];
	return graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const removeAllStatusLabels = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [
		labels.statusNew,
		labels.statusPlanning,
		labels.statusNeedsFeedback,
		labels.statusInProgress,
		labels.statusCodeReview,
		labels.statusPleaseFix,
		labels.statusApproved,
		labels.statusNeedsTesting,
		labels.statusCompleted,
		labels.statusBlocked,
		labels.statusDuplicate,
		labels.statusInvalid,
	];
	return graphql(removeLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

export const assignStatusLabels = async (
	pullRequest: PullRequest
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	// eslint-disable-next-line no-console
	console.log('%c pullRequest', 'color: HotPink;', pullRequest);
	await removeAllStatusLabels(pullRequest.id);
	switch (pullRequest.state) {
		case 'OPEN':
			// for OPEN PRs, let's first look whether a code review has either been requested or received a response
			// see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					return assignLabelsAfterReviewApproved(pullRequest.id);
				case 'CHANGES_REQUESTED':
					return assignLabelsAfterReviewChangesRequested(pullRequest.id);
				case 'REVIEW_REQUIRED':
					return assignLabelsAfterReviewRequested(pullRequest.id);
				case null:
					return assignLabelsAfterCreated(pullRequest.id);
			}
			break;
		case 'CLOSED':
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					return assignLabelsAfterMerge(pullRequest.id);
				case null:
					return assignLabelsAfterClose(pullRequest.id);
			}
			break;
		case 'MERGED':
			return assignLabelsAfterMerge(pullRequest.id);
	}
};
