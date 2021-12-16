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
const labels_1 = require("./labels");
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
const assignLabelsAfterClose = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusInvalid];
        return yield (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterMerge = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusCompleted];
        return yield (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterCreated = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusNew];
        return yield (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewApproved = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusApproved];
        return yield (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewChangesRequested = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusPleaseFix];
        return yield (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignLabelsAfterReviewRequested = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [labels_1.labels.statusCodeReview];
        return yield (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const removeAllStatusLabels = (labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const labelIds = [
            labels_1.labels.statusNew,
            labels_1.labels.statusPlanning,
            labels_1.labels.statusNeedsFeedback,
            labels_1.labels.statusInProgress,
            labels_1.labels.statusCodeReview,
            labels_1.labels.statusPleaseFix,
            labels_1.labels.statusApproved,
            labels_1.labels.statusNeedsTesting,
            labels_1.labels.statusCompleted,
            labels_1.labels.statusBlocked,
            labels_1.labels.statusDuplicate,
            labels_1.labels.statusInvalid,
        ];
        return yield (0, utils_1.graphqlWithAuth)(removeLabelsMutation, { labelIds, labelableId });
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
const assignStatusLabels = (pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // eslint-disable-next-line no-console
        console.log('%c pullRequest', 'color: HotPink;', pullRequest);
        yield removeAllStatusLabels(pullRequest.id);
        switch (pullRequest.state) {
            case 'OPEN':
                // for OPEN PRs, let's first look whether a code review has either been requested or received a response
                // see: https://docs.github.com/en/graphql/reference/enums#pullrequestreviewdecision
                switch (pullRequest.reviewDecision) {
                    case 'APPROVED':
                        yield assignLabelsAfterReviewApproved(pullRequest.id);
                        break;
                    case 'CHANGES_REQUESTED':
                        yield assignLabelsAfterReviewChangesRequested(pullRequest.id);
                        break;
                    case 'REVIEW_REQUIRED':
                        yield assignLabelsAfterReviewRequested(pullRequest.id);
                        break;
                    case null:
                        yield assignLabelsAfterCreated(pullRequest.id);
                        break;
                }
                break;
            case 'CLOSED':
                switch (pullRequest.reviewDecision) {
                    case 'APPROVED':
                        yield assignLabelsAfterMerge(pullRequest.id);
                        break;
                    case null:
                        yield assignLabelsAfterClose(pullRequest.id);
                        break;
                }
                break;
            case 'MERGED':
                yield assignLabelsAfterMerge(pullRequest.id);
                break;
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
exports.assignStatusLabels = assignStatusLabels;
