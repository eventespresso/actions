"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStatusLabels = exports.assignLabelsToMergedPullRequests = exports.assignLabelsToClosedPullRequests = exports.assignLabelsToOpenPullRequests = exports.assignLabelsToClosingIssues = void 0;
const core = __importStar(require("@actions/core"));
const espressoStaff_1 = require("./espressoStaff");
const constants_1 = require("./constants");
const labels_1 = require("./labels");
const mutations_1 = require("./mutations");
/**
 * adds the supplied assignees to the specified Issue or Pull Request
 *
 * @param assignableId ID
 * @param assigneeIds [ID]
 * @returns Promise<GraphQlQueryResponse<AssigneesQueryResponse>>
 */
const addAssignees = (assignableId, assigneeIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // eslint-disable-next-line no-console
        console.log('%c addAssignees', 'color: HotPink;', { assignableId, assigneeIds });
        return yield (0, mutations_1.addAssigneesMutation)(assignableId, assigneeIds);
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
/**
 * assigns Q/A staff to the specified Pull Request
 *
 * @param assignableId ID
 * @returns Promise<GraphQlQueryResponse<AssigneesQueryResponse>>
 */
const addAssigneesAfterReviewApproved = (assignableId) => __awaiter(void 0, void 0, void 0, function* () {
    // filter out any staff who are not Q/A then return array of IDs
    const supportStaff = espressoStaff_1.espressoStaff.filter((staff) => staff.support).map((support) => support.id);
    return yield addAssignees(assignableId, supportStaff);
});
/**
 * adds the supplied labels to the specified Issue or Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const addLabels = (labelIds, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // eslint-disable-next-line no-console
        console.log('%c labelMutation', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, mutations_1.addLabelsMutation)(labelIds, labelableId);
    }
    catch (error) {
        core.setFailed(error.message);
        return false;
    }
});
/**
 * returns true if the supplied Pull Request has the specified label
 *
 * @param pullRequest: PullRequest
 * @param labelableId ID
 * @returns boolean
 */
const hasLabel = (pullRequest, labelableId) => {
    try {
        // eslint-disable-next-line no-console
        console.log('%c hasLabel', 'color: HotPink;', { pullRequest, labelableId });
        const existingLabels = pullRequest.labels.nodes.map((label) => label.id);
        return existingLabels.includes(labelableId);
    }
    catch (error) {
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
const assignHasFixLabel = (labels, otherRepoLabels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    yield removeAllStatusLabels(labels, labelableId, labels.statusNeedsTesting.id);
    const added = yield addLabels([labels.statusHasFix.id], labelableId);
    // label might be for the other repo, so if the above does not return false, return it
    if (added !== false) {
        return added;
    }
    // otherwise try the other repo's label
    return yield addLabels([otherRepoLabels.statusHasFix.id], labelableId);
});
/**
 * adds the `invalid` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterClose = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusInvalid.id], labelableId);
});
/**
 * adds the `completed` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterMerge = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusCompleted.id], labelableId);
});
/**
 * adds the `new` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterCreated = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusNew.id], labelableId);
});
/**
 * adds the `approved` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewApproved = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusApproved.id, labels.statusNeedsTesting.id], labelableId);
});
/**
 * adds the `please fix` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewChangesRequested = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusPleaseFix.id], labelableId);
});
/**
 * adds the `code review` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewRequested = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusCodeReview.id], labelableId);
});
/**
 * adds the `in progress` label to the specified Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsAfterReviewRequestRemoved = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addLabels([labels.statusInProgress.id], labelableId);
});
/**
 * removes all status labels from the specified Issue or Pull Request
 *
 * @param labels LabelList
 * @param labelableId ID
 * @param except ID 		ID of a label to exclude from removal
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const removeAllStatusLabels = (labels, labelableId, except = '') => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let labelIds = [
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
        return yield (0, mutations_1.removeLabelsMutation)(labelIds, labelableId);
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
/**
 * loops through any related closing Issues and assigns the `has fix` label
 *
 * @param closingIssues IssueConnection
 * @param repo RepoName
 */
const assignLabelsToClosingIssues = (closingIssues, repo) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line no-console
    console.log('%c assignLabelsToClosingIssues', 'color: HotPink;', closingIssues);
    if (closingIssues.totalCount > 0) {
        const issues = closingIssues.nodes;
        const labels = labels_1.repoLabels[repo];
        const otherRepoLabels = labels_1.repoLabels[repo === 'barista' ? 'cafe' : 'barista'];
        for (const issue of issues) {
            // eslint-disable-next-line no-console
            console.log('%c  closing Issue', 'color: DeepPink;', issue);
            yield assignHasFixLabel(labels, otherRepoLabels, issue === null || issue === void 0 ? void 0 : issue.id);
        }
    }
});
exports.assignLabelsToClosingIssues = assignLabelsToClosingIssues;
/**
 * assigns status labels to open Pull Requests
 *
 * @param labels LabelList
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsToOpenPullRequests = (labels, pullRequest, repo) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.assignLabelsToClosingIssues)(pullRequest.closingIssuesReferences, repo);
    // for OPEN PRs, let's first look whether a code review has either been requested or received a response
    // see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
    switch (pullRequest.reviewDecision) {
        case constants_1.PR_REVIEW_DECISION.APPROVED:
            if (hasLabel(pullRequest, labels.statusInProgress.id)) {
                return 'PR in progress... you no touchy!';
            }
            if (hasLabel(pullRequest, labels.statusMerge.id)) {
                return 'PR ready for merge';
            }
            yield removeAllStatusLabels(labels, pullRequest.id, labels.statusNeedsTesting.id);
            yield addAssigneesAfterReviewApproved(pullRequest.id);
            return yield assignLabelsAfterReviewApproved(labels, pullRequest.id);
        case constants_1.PR_REVIEW_DECISION.CHANGES_REQUESTED:
            yield removeAllStatusLabels(labels, pullRequest.id, labels.statusPleaseFix.id);
            return yield assignLabelsAfterReviewChangesRequested(labels, pullRequest.id);
        case constants_1.PR_REVIEW_DECISION.REVIEW_REQUIRED:
            if (pullRequest.reviewRequests.totalCount > 0) {
                yield removeAllStatusLabels(labels, pullRequest.id, labels.statusCodeReview.id);
                return yield assignLabelsAfterReviewRequested(labels, pullRequest.id);
            }
            else {
                yield removeAllStatusLabels(labels, pullRequest.id, labels.statusInProgress.id);
                return yield assignLabelsAfterReviewRequestRemoved(labels, pullRequest.id);
            }
        default:
            break;
    }
    return assignLabelsAfterCreated(labels, pullRequest.id);
});
exports.assignLabelsToOpenPullRequests = assignLabelsToOpenPullRequests;
/**
 * assigns status labels to closed Pull Requests
 *
 * @param labels LabelList
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsToClosedPullRequests = (labels, pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
    if (pullRequest.reviewDecision === constants_1.PR_REVIEW_DECISION.APPROVED) {
        yield removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
        return yield assignLabelsAfterMerge(labels, pullRequest.id);
    }
    yield removeAllStatusLabels(labels, pullRequest.id, labels.statusInvalid.id);
    return yield assignLabelsAfterClose(labels, pullRequest.id);
});
exports.assignLabelsToClosedPullRequests = assignLabelsToClosedPullRequests;
/**
 * assigns status labels to merged Pull Requests
 *
 * @param labels LabelList
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | false>
 */
const assignLabelsToMergedPullRequests = (labels, pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
    yield removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
    return yield assignLabelsAfterMerge(labels, pullRequest.id);
});
exports.assignLabelsToMergedPullRequests = assignLabelsToMergedPullRequests;
/**
 * assigns status labels to Pull Requests
 *
 * @param repo: RepoName
 * @param pullRequest: PullRequest
 * @returns Promise<GraphQlQueryResponse<LabelsQueryResponse> | string | false>
 */
const assignStatusLabels = (repo, pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // eslint-disable-next-line no-console
        console.log('%c pullRequest.state', 'color: HotPink;', pullRequest.state);
        // eslint-disable-next-line no-console
        console.log('%c pullRequest.reviewDecision', 'color: HotPink;', pullRequest.reviewDecision);
        const labels = labels_1.repoLabels[repo];
        // eslint-disable-next-line no-console
        console.log('%c repoLabels', 'color: DeepPink;', labels);
        switch (pullRequest.state) {
            case constants_1.PR_STATE.OPEN:
                return yield (0, exports.assignLabelsToOpenPullRequests)(labels, pullRequest, repo);
            case constants_1.PR_STATE.CLOSED:
                return yield (0, exports.assignLabelsToClosedPullRequests)(labels, pullRequest);
            case constants_1.PR_STATE.MERGED:
                return yield (0, exports.assignLabelsToMergedPullRequests)(labels, pullRequest);
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
exports.assignStatusLabels = assignStatusLabels;
