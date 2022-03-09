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
const assignLabelsAfterClose = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusInvalid.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterClose', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterMerge = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusCompleted.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterMerge', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterCreated = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusNew.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterCreated', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewApproved = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusApproved.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewApproved', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewChangesRequested = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusPleaseFix.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewChangesRequested', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewRequested = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusCodeReview.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewRequestRemoved = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusInProgress.id];
        // eslint-disable-next-line no-console
        console.log('%c assignLabelsAfterReviewRequested', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(addLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const removeAllStatusLabels = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [
            labels_1.labels.statusNew.id,
            labels_1.labels.statusPlanning.id,
            labels_1.labels.statusNeedsFeedback.id,
            labels_1.labels.statusInProgress.id,
            labels_1.labels.statusCodeReview.id,
            labels_1.labels.statusPleaseFix.id,
            labels_1.labels.statusApproved.id,
            labels_1.labels.statusNeedsTesting.id,
            labels_1.labels.statusCompleted.id,
            labels_1.labels.statusBlocked.id,
            labels_1.labels.statusDuplicate.id,
            labels_1.labels.statusInvalid.id,
        ];
        // eslint-disable-next-line no-console
        console.log('%c removeAllStatusLabels', 'color: HotPink;', { labelableId, labelIds });
        return yield (0, graphql_1.graphql)(removeLabelsMutation, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignStatusLabels = (pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
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
                    yield removeAllStatusLabels(pullRequest.id);
                    return yield assignLabelsAfterReviewApproved(pullRequest.id);
                case 'CHANGES_REQUESTED':
                    yield removeAllStatusLabels(pullRequest.id);
                    return yield assignLabelsAfterReviewChangesRequested(pullRequest.id);
                case 'REVIEW_REQUIRED':
                    if (pullRequest.reviewRequests.totalCount > 0) {
                        yield removeAllStatusLabels(pullRequest.id);
                        return yield assignLabelsAfterReviewRequested(pullRequest.id);
                    }
                    else {
                        yield removeAllStatusLabels(pullRequest.id);
                        return yield assignLabelsAfterReviewRequestRemoved(pullRequest.id);
                    }
                default:
                    break;
            }
            return assignLabelsAfterCreated(pullRequest.id);
        case 'CLOSED':
            switch (pullRequest.reviewDecision) {
                case 'APPROVED':
                    yield removeAllStatusLabels(pullRequest.id);
                    return yield assignLabelsAfterMerge(pullRequest.id);
                case null:
                    yield removeAllStatusLabels(pullRequest.id);
                    return yield assignLabelsAfterClose(pullRequest.id);
            }
            break;
        case 'MERGED':
            yield removeAllStatusLabels(pullRequest.id);
            return yield assignLabelsAfterMerge(pullRequest.id);
    }
});
exports.assignStatusLabels = assignStatusLabels;
