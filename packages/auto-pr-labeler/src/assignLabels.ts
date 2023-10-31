import * as core from '@actions/core';

import { espressoStaff } from './espressoStaff';
import { PR_REVIEW_DECISION, PR_STATE } from './constants';
import { repoLabels } from './labels';
import { addAssigneesMutation, addLabelsMutation, removeLabelsMutation } from './mutations';

import type {
	AssigneesQueryResponse,
	ID,
	IssueConnection,
	LabelList,
	LabelsQueryResponse,
	PullRequest,
	RepoName,
} from './types';
import type { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';

/**
 * adds the supplied assignees to the specified Issue or Pull Request
 *
 * @param assignableId ID
 * @param assigneeIds [ID]
 * @returns Promise<GraphQlQueryResponse<AssigneesQueryResponse>>
 */
const addAssignees = async (
	assignableId: ID,
	assigneeIds: Array<ID>
): Promise<GraphQlQueryResponse<AssigneesQueryResponse>> => {
	try {
		// eslint-disable-next-line no-console
		console.log('%c addAssignees', 'color: HotPink;', { assignableId, assigneeIds });
		return await addAssigneesMutation(assignableId, assigneeIds);
	} catch (error) {
		core.setFailed(error.message);
	}
};

/**
 * assigns Q/A staff to the specified Pull Request
 *
 * @param assignableId ID
 * @returns Promise<GraphQlQueryResponse<AssigneesQueryResponse>>
 */
const addAssigneesAfterReviewApproved = async (
	assignableId: ID
): Promise<GraphQlQueryResponse<AssigneesQueryResponse>> => {
	// filter out any staff who are not Q/A then return array of IDs
	const supportStaff = espressoStaff.filter((staff) => staff.support).map((support) => support.id);
	return await addAssignees(assignableId, supportStaff);
};

/**
 * adds the supplied labels to the specified Issue or Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const addLabels = async (
	labelIds: Array<ID>,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	try {
		// eslint-disable-next-line no-console
		console.log('%c labelMutation', 'color: HotPink;', { labelableId, labelIds });
		return await addLabelsMutation(labelIds, labelableId);
	} catch (error) {
		core.setFailed(error.message);
		return false;
	}
};

/**
 * returns true if the supplied Pull Request has the specified label
 *
 * @param pullRequest: PullRequest
 * @param labelableId ID
 * @returns boolean
 */
const hasLabel = (pullRequest: PullRequest, labelableId: ID): boolean => {
	try {
		// eslint-disable-next-line no-console
		console.log('%c hasLabel', 'color: HotPink;', { pullRequest, labelableId });
		const existingLabels = pullRequest.labels.nodes.map((label) => label.id);
		return existingLabels.includes(labelableId);
	} catch (error) {
		core.setFailed(error.message);
	}
};

/**
 * adds the `has fix` label to the specified Issue,
 * since it's possible that the Issue is in the other repo
 * we first try the label from the same issue as the PR
 * if that fails, we try the label from the other repo
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignHasFixLabel = async (
	labels: LabelList,
	otherRepoLabels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	await removeAllStatusLabels(labels, labelableId, labels.statusNeedsTesting.id);
	const added = await addLabels([labels.statusHasFix.id], labelableId);
	// label might be for the other repo, so if the above does not return false, return it
	if (added !== false) {
		return added;
	}
	// otherwise try the other repo's label
	return await addLabels([otherRepoLabels.statusHasFix.id], labelableId);
};

/**
 * adds the `invalid` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterClose = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusInvalid.id], labelableId);
};

/**
 * adds the `completed` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterMerge = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusCompleted.id], labelableId);
};

/**
 * adds the `new` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterCreated = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusNew.id], labelableId);
};

/**
 * adds the `approved` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewApproved = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusApproved.id, labels.statusNeedsTesting.id], labelableId);
};

/**
 * adds the `please fix` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewChangesRequested = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusPleaseFix.id], labelableId);
};

/**
 * adds the `code review` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewRequested = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusCodeReview.id], labelableId);
};

/**
 * adds the `in progress` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewRequestRemoved = async (
	labels: LabelList,
	labelableId: ID
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	return await addLabels([labels.statusInProgress.id], labelableId);
};

/**
 * removes all status labels from the specified Issue or Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @param except ID 		ID of a label to exclude from removal
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const removeAllStatusLabels = async (
	labels: LabelList,
	labelableId: ID,
	except: ID = ''
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
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
			labels.statusMerge.id,
			labels.statusCompleted.id,
			// labels.statusBlocked.id,
			// labels.statusDuplicate.id,
			// labels.statusInvalid.id,
			// labels.statusWontFix.id,
			// labels.statusBackburner.id,
		];
		if (except !== '') {
			labelIds = labelIds.filter((labelID) => labelID !== except);
		}
		// eslint-disable-next-line no-console
		console.log('%c removeAllStatusLabels', 'color: HotPink;', { labelableId, labelIds });
		return await removeLabelsMutation(labelIds, labelableId);
	} catch (error) {
		core.setFailed(error.message);
	}
};

/**
 * loops through any related closing Issues and assigns the `has fix` label
 *
 * @param closingIssues IssueConnection
 * @param repo RepoName
 */
export const assignLabelsToClosingIssues = async (closingIssues: IssueConnection, repo: RepoName) => {
	// eslint-disable-next-line no-console
	console.log('%c assignLabelsToClosingIssues', 'color: HotPink;', closingIssues);
	if (closingIssues.totalCount > 0) {
		const issues = closingIssues.nodes;
		const labels = repoLabels[repo];
		const otherRepoLabels = repoLabels[repo === 'barista' ? 'cafe' : 'barista'];
		for (const issue of issues) {
			// eslint-disable-next-line no-console
			console.log('%c  closing Issue', 'color: DeepPink;', issue);
			await assignHasFixLabel(labels, otherRepoLabels, issue?.id);
		}
	}
};

/**
 * assigns status labels to open Pull Requests
 *
 * @param labels LabelList
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
export const assignLabelsToOpenPullRequests = async (
	labels: LabelList,
	pullRequest: PullRequest,
	repo: RepoName
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | string | false> => {
	await assignLabelsToClosingIssues(pullRequest.closingIssuesReferences, repo);
	// for OPEN PRs, let's first look whether a code review has either been requested or received a response
	// see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
	switch (pullRequest.reviewDecision) {
		case PR_REVIEW_DECISION.APPROVED:
			if (hasLabel(pullRequest, labels.statusMerge.id)) {
				return 'PR ready for merge';
			}
			await removeAllStatusLabels(labels, pullRequest.id, labels.statusNeedsTesting.id);
			await addAssigneesAfterReviewApproved(pullRequest.id);
			return await assignLabelsAfterReviewApproved(labels, pullRequest.id);
		case PR_REVIEW_DECISION.CHANGES_REQUESTED:
			await removeAllStatusLabels(labels, pullRequest.id, labels.statusPleaseFix.id);
			return await assignLabelsAfterReviewChangesRequested(labels, pullRequest.id);
		case PR_REVIEW_DECISION.REVIEW_REQUIRED:
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
};

/**
 * assigns status labels to closed Pull Requests
 *
 * @param labels LabelList
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
export const assignLabelsToClosedPullRequests = async (
	labels: LabelList,
	pullRequest: PullRequest
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	if (pullRequest.reviewDecision === PR_REVIEW_DECISION.APPROVED) {
		await removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
		return await assignLabelsAfterMerge(labels, pullRequest.id);
	}
	await removeAllStatusLabels(labels, pullRequest.id, labels.statusInvalid.id);
	return await assignLabelsAfterClose(labels, pullRequest.id);
};

/**
 * assigns status labels to merged Pull Requests
 *
 * @param labels LabelList
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
export const assignLabelsToMergedPullRequests = async (
	labels: LabelList,
	pullRequest: PullRequest
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | false> => {
	await removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
	return await assignLabelsAfterMerge(labels, pullRequest.id);
};

/**
 * assigns status labels to Pull Requests
 *
 * @param repo: RepoName
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | string | false>
 */
export const assignStatusLabels = async (
	repo: RepoName,
	pullRequest: PullRequest
): Promise<GraphQlQueryResponse<LabelsQueryResponse> | string | false> => {
	try {
		// eslint-disable-next-line no-console
		console.log('%c pullRequest.state', 'color: HotPink;', pullRequest.state);
		// eslint-disable-next-line no-console
		console.log('%c pullRequest.reviewDecision', 'color: HotPink;', pullRequest.reviewDecision);
		const labels = repoLabels[repo];
		// eslint-disable-next-line no-console
		console.log('%c repoLabels', 'color: DeepPink;', labels);
		switch (pullRequest.state) {
			case PR_STATE.OPEN:
				return await assignLabelsToOpenPullRequests(labels, pullRequest, repo);
			case PR_STATE.CLOSED:
				return await assignLabelsToClosedPullRequests(labels, pullRequest);
			case PR_STATE.MERGED:
				return await assignLabelsToMergedPullRequests(labels, pullRequest);
		}
	} catch (error) {
		core.setFailed(error.message);
	}
};
