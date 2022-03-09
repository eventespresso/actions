import * as core from '@actions/core';
import type { ID, LabelsQueryResponse, PullRequest } from './types';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';
import { gqlVariables } from './utils';
import { graphql } from '@octokit/graphql';
import { labels } from './labels';

const addLabelsMutation = `
			mutation ($labelIds: [ID]!, $labelableId: ID!) {
				addLabelsToLabelable(
					input: {
						labelIds: $labelIds,
						labelableId: $labelableId
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
			mutation ($labelIds: [ID]!, $labelableId: ID!) {
				removeLabelsFromLabelable(
					input: {
						labelIds: $labelIds,
						labelableId: $labelableId
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

const assignLabelsAfterClose = async (labelableId: ID): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusInvalid.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterClose', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterMerge = async (labelableId: ID): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusCompleted.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterMerge', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterCreated = async (labelableId: ID): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusNew.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterCreated', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewApproved = async (labelableId: ID): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusApproved.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewApproved', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewChangesRequested = async (
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusPleaseFix.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewChangesRequested', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewRequested = async (
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusCodeReview.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewRequestRemoved = async (
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusInProgress.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const removeAllStatusLabels = async (labelableId: ID): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [
			labels.statusNew.id,
			labels.statusPlanning.id,
			labels.statusNeedsFeedback.id,
			labels.statusInProgress.id,
			labels.statusCodeReview.id,
			labels.statusPleaseFix.id,
			labels.statusApproved.id,
			labels.statusNeedsTesting.id,
			labels.statusCompleted.id,
			labels.statusBlocked.id,
			labels.statusDuplicate.id,
			labels.statusInvalid.id,
		];
		// eslint-disable-next-line no-console
		console.log('%c removeAllStatusLabels', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(removeLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
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
					if (pullRequest.reviewRequests.totalCount > 0) {
						await removeAllStatusLabels(pullRequest.id);
						return await assignLabelsAfterReviewRequested(pullRequest.id);
					} else {
						await removeAllStatusLabels(pullRequest.id);
						return await assignLabelsAfterReviewRequestRemoved(pullRequest.id);
					}
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
