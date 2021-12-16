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

const assignLabelsAfterClose = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusInvalid];
	return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterMerge = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCompleted];
	return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterCreated = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusNew];
	return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterReviewApproved = async (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusApproved];
	return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterReviewChangesRequested = async (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusPleaseFix];
	return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const assignLabelsAfterReviewRequested = async (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCodeReview];
	return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

const removeAllStatusLabels = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
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
	return await graphql(removeLabelsMutation, { labelIds, labelableId, ...gqlVariables });
};

export const assignStatusLabels = async (
	pullRequest: PullRequest
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	// eslint-disable-next-line no-console
	console.log('%c pullRequest.state', 'color: HotPink;', pullRequest.state);
	// eslint-disable-next-line no-console
	console.log('%c pullRequest.reviewDecision', 'color: HotPink;', pullRequest.reviewDecision);
	switch (pullRequest.state) {
		case 'OPEN':
			// for OPEN PRs, let's first look whether a code review has either been requested or received a response
			// see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					await removeAllStatusLabels(pullRequest.id);
					return await assignLabelsAfterReviewApproved(pullRequest.id);
				case 'CHANGES_REQUESTED':
					await removeAllStatusLabels(pullRequest.id);
					return await assignLabelsAfterReviewChangesRequested(pullRequest.id);
				case 'REVIEW_REQUIRED':
					await removeAllStatusLabels(pullRequest.id);
					return await assignLabelsAfterReviewRequested(pullRequest.id);
				default:
					break;
			}
			return assignLabelsAfterCreated(pullRequest.id);
		case 'CLOSED':
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					await removeAllStatusLabels(pullRequest.id);
					return await assignLabelsAfterMerge(pullRequest.id);
				case null:
					await removeAllStatusLabels(pullRequest.id);
					return await assignLabelsAfterClose(pullRequest.id);
			}
			break;
		case 'MERGED':
			await removeAllStatusLabels(pullRequest.id);
			return await assignLabelsAfterMerge(pullRequest.id);
	}
};
