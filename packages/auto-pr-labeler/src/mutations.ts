import type { LabelsQueryResponse, PullRequest } from './types';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';
import { graphqlWithAuth } from './utils';
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
	return graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterMerge = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCompleted];
	return graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterCreated = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusNew];
	return graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterReviewApproved = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusApproved];
	return graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterReviewChangesRequested = (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusPleaseFix];
	return graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterReviewRequested = (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCodeReview];
	return graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
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
	return graphqlWithAuth(removeLabelsMutation, { labelIds, labelableId });
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
