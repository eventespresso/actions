import * as core from '@actions/core';
import type { ID, LabelList, LabelsQueryResponse, PullRequest, RepoName } from './types';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';
import { gqlVariables } from './utils';
import { graphql } from '@octokit/graphql';
import { repoLabels } from './labels';

const addLabelsMutation = `
			mutation ($labelIds: [ID!]!, $labelableId: ID!) {
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
			mutation ($labelIds: [ID!]!, $labelableId: ID!) {
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

const assignLabelsAfterClose = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusInvalid.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterClose', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterMerge = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusCompleted.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterMerge', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterCreated = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusNew.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterCreated', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewApproved = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusApproved.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewApproved', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewChangesRequested = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusPleaseFix.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewChangesRequested', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewRequested = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusCodeReview.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const assignLabelsAfterReviewRequestRemoved = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		const labelIds: Array<ID> = [labels.statusInProgress.id];
		// eslint-disable-next-line no-console
		console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(addLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

const removeAllStatusLabels = async (
	labels: LabelList,
	labelableId: ID,
	except: ID = ''
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	try {
		let labelIds: Array<ID> = [
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
		if (except !== '') {
			labelIds = labelIds.filter((labelID) => labelID !== except);
		}
		// eslint-disable-next-line no-console
		console.log('%c removeAllStatusLabels', 'color: HotPink;', { labelableId, labelIds });
		return await graphql(removeLabelsMutation, { labelIds, labelableId, ...gqlVariables });
	} catch (error) {
		core.setFailed(error.message);
	}
};

export const assignStatusLabels = async (
	repo: RepoName,
	pullRequest: PullRequest
): Promise<GraphQlQueryResponse<LabelsQueryResponse>> => {
	// eslint-disable-next-line no-console
	console.log('%c pullRequest.state', 'color: HotPink;', pullRequest.state);
	// eslint-disable-next-line no-console
	console.log('%c pullRequest.reviewDecision', 'color: HotPink;', pullRequest.reviewDecision);
	const labels = repoLabels[repo];
	// eslint-disable-next-line no-console
	console.log('%c repoLabels', 'color: DeepPink;', labels);
	switch (pullRequest.state) {
		case 'OPEN':
			// for OPEN PRs, let's first look whether a code review has either been requested or received a response
			// see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					await removeAllStatusLabels(labels, pullRequest.id, labels.statusApproved.id);
					return await assignLabelsAfterReviewApproved(labels, pullRequest.id);
				case 'CHANGES_REQUESTED':
					await removeAllStatusLabels(labels, pullRequest.id, labels.statusPleaseFix.id);
					return await assignLabelsAfterReviewChangesRequested(labels, pullRequest.id);
				case 'REVIEW_REQUIRED':
					if (pullRequest.reviewRequests.totalCount > 0) {
						await removeAllStatusLabels(labels, pullRequest.id, labels.statusCodeReview.id);
						return await assignLabelsAfterReviewRequested(labels, pullRequest.id);
					} else {
						await removeAllStatusLabels(labels, pullRequest.id, labels.statusInProgress.id);
						return await assignLabelsAfterReviewRequestRemoved(labels, pullRequest.id);
					}
				default:
					break;
			}
			return assignLabelsAfterCreated(labels, pullRequest.id);
		case 'CLOSED':
			switch (pullRequest.reviewDecision) {
				case 'APPROVED':
					await removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
					return await assignLabelsAfterMerge(labels, pullRequest.id);
				case null:
					await removeAllStatusLabels(labels, pullRequest.id, labels.statusInvalid.id);
					return await assignLabelsAfterClose(labels, pullRequest.id);
			}
			break;
		case 'MERGED':
			await removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
			return await assignLabelsAfterMerge(labels, pullRequest.id);
	}
};
