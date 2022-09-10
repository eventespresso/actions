"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.assignStatusLabels = void 0;
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const graphql_1 = require("@octokit/graphql");
const labels_1 = require("./labels");
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
const assignLabelsAfterClose = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusInvalid.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterClose', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterMerge = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusCompleted.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterMerge', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterCreated = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusNew.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterCreated', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewApproved = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusApproved.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewApproved', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewChangesRequested = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusPleaseFix.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewChangesRequested', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewRequested = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusCodeReview.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewRequestRemoved = (labels, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels.statusInProgress.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
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
            labels.statusCompleted.id,
            labels.statusBlocked.id,
            labels.statusDuplicate.id,
            labels.statusInvalid.id,
        ];
        if (except !== '') {
            labelIds = labelIds.filter(labelID => labelID !== except);
        }
        // eslint-disable-next-line no-console
        console.log('%c removeAllStatusLabels', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(removeLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignStatusLabels = (repo, pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line no-console
    console.log('%c pullRequest.state', 'color: HotPink;', pullRequest.state);
    // eslint-disable-next-line no-console
    console.log('%c pullRequest.reviewDecision', 'color: HotPink;', pullRequest.reviewDecision);
    const labels = labels_1.repoLabels[repo];
    // eslint-disable-next-line no-console
    console.log('%c repoLabels', 'color: DeepPink;', labels);
    switch (pullRequest.state) {
        case 'OPEN':
            // for OPEN PRs, let's first look whether a code review has either been requested or received a response
            // see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
            switch (pullRequest.reviewDecision) {
                case 'APPROVED':
                    yield removeAllStatusLabels(labels, pullRequest.id, labels.statusApproved.id);
                    return yield assignLabelsAfterReviewApproved(labels, pullRequest.id);
                case 'CHANGES_REQUESTED':
                    yield removeAllStatusLabels(labels, pullRequest.id, labels.statusPleaseFix.id);
                    return yield assignLabelsAfterReviewChangesRequested(labels, pullRequest.id);
                case 'REVIEW_REQUIRED':
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
        case 'CLOSED':
            switch (pullRequest.reviewDecision) {
                case 'APPROVED':
                    yield removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
                    return yield assignLabelsAfterMerge(labels, pullRequest.id);
                case null:
                    yield removeAllStatusLabels(labels, pullRequest.id, labels.statusInvalid.id);
                    return yield assignLabelsAfterClose(labels, pullRequest.id);
            }
            break;
        case 'MERGED':
            yield removeAllStatusLabels(labels, pullRequest.id, labels.statusCompleted.id);
            return yield assignLabelsAfterMerge(labels, pullRequest.id);
    }
});
exports.assignStatusLabels = assignStatusLabels;
