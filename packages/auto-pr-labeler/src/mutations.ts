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

const assignLabelsAfterClose = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusInvalid];
	return await graphqlWithAuth(token)(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterMerge = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCompleted];
	return await graphqlWithAuth(token)(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterCreated = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusNew];
	return await graphqlWithAuth(token)(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterReviewApproved = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusApproved];
	return await graphqlWithAuth(token)(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterReviewChangesRequested = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusPleaseFix];
	return await graphqlWithAuth(token)(addLabelsMutation, { labelIds, labelableId });
};

const assignLabelsAfterReviewRequested = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	const labelIds = [labels.statusCodeReview];
	return await graphqlWithAuth(token)(addLabelsMutation, { labelIds, labelableId });
};

const removeAllStatusLabels = async (
	labelableId: string,
	token: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
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
	return await graphqlWithAuth(token)(removeLabelsMutation, { labelIds, labelableId });
};

export const assignStatusLabels = async (pullRequest: PullRequest, token: string): Promise<void> => {
	// eslint-disable-next-line no-console
	console.log('%c pullRequest', 'color: HotPink;', pullRequest);
	await removeAllStatusLabels(pullRequest.id, token);
	switch (pullRequest.state) {
		case 'OPEN':
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					await assignLabelsAfterReviewApproved(pullRequest.id, token);
					break;
				case 'CHANGES_REQUESTED':
					await assignLabelsAfterReviewChangesRequested(pullRequest.id, token);
					break;
				case 'REVIEW_REQUIRED':
					await assignLabelsAfterReviewRequested(pullRequest.id, token);
					break;
				case null:
					await assignLabelsAfterCreated(pullRequest.id, token);
					break;
			}
			break;
		case 'CLOSED':
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					await assignLabelsAfterMerge(pullRequest.id, token);
					break;
				case null:
					await assignLabelsAfterClose(pullRequest.id, token);
					break;
			}
			break;
		case 'MERGED':
			await assignLabelsAfterMerge(pullRequest.id, token);
			break;
	}
};
