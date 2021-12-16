import * as core from '@actions/core';
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

const assignLabelsAfterClose = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusInvalid];
		return await graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterMerge = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusCompleted];
		return await graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterCreated = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusNew];
		return await graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewApproved = async (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusApproved];
		return await graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewChangesRequested = async (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusPleaseFix];
		return await graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewRequested = async (
	labelableId: string
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds = [labels.statusCodeReview];
		return await graphqlWithAuth(addLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const removeAllStatusLabels = async (labelableId: string): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
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
		return await graphqlWithAuth(removeLabelsMutation, { labelIds, labelableId });
	} catch (error) {
		core.setFailed(error.message);
	}
};

export const assignStatusLabels = async (pullRequest: PullRequest): Promise<void> => {
	try {
		// eslint-disable-next-line no-console
		console.log('%c pullRequest', 'color: HotPink;', pullRequest);
		await removeAllStatusLabels(pullRequest.id);
		switch (pullRequest.state) {
			case 'OPEN':
				// for OPEN PRs, let's first look whether a code review has either been requested or received a response
				// see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
				switch (pullRequest.reviewDecision) {
					case 'APPROVED':
						await assignLabelsAfterReviewApproved(pullRequest.id);
						break;
					case 'CHANGES_REQUESTED':
						await assignLabelsAfterReviewChangesRequested(pullRequest.id);
						break;
					case 'REVIEW_REQUIRED':
						await assignLabelsAfterReviewRequested(pullRequest.id);
						break;
					case null:
						await assignLabelsAfterCreated(pullRequest.id);
						break;
				}
				break;
			case 'CLOSED':
				switch (pullRequest.reviewDecision) {
					case 'APPROVED':
						await assignLabelsAfterMerge(pullRequest.id);
						break;
					case null:
						await assignLabelsAfterClose(pullRequest.id);
						break;
				}
				break;
			case 'MERGED':
				await assignLabelsAfterMerge(pullRequest.id);
				break;
		}
	} catch (error) {
		core.setFailed(error.message);
	}
};
