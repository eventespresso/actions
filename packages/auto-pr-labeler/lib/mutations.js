"use strict";
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
const assignLabelsAfterClose = (labelableId) => {
    const labelIds = [labels_1.labels.statusInvalid];
    return (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
};
const assignLabelsAfterMerge = (labelableId) => {
    const labelIds = [labels_1.labels.statusCompleted];
    return (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
};
const assignLabelsAfterCreated = (labelableId) => {
    const labelIds = [labels_1.labels.statusNew];
    return (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
};
const assignLabelsAfterReviewApproved = (labelableId) => {
    const labelIds = [labels_1.labels.statusApproved];
    return (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
};
const assignLabelsAfterReviewChangesRequested = (labelableId) => {
    const labelIds = [labels_1.labels.statusPleaseFix];
    return (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
};
const assignLabelsAfterReviewRequested = (labelableId) => {
    const labelIds = [labels_1.labels.statusCodeReview];
    return (0, utils_1.graphqlWithAuth)(addLabelsMutation, { labelIds, labelableId });
};
const removeAllStatusLabels = (labelableId) => {
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
    return (0, utils_1.graphqlWithAuth)(removeLabelsMutation, { labelIds, labelableId });
};
const assignStatusLabels = (pullRequest) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line no-console
    console.log('%c pullRequest', 'color: HotPink;', pullRequest);
    yield removeAllStatusLabels(pullRequest.id);
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
});
exports.assignStatusLabels = assignStatusLabels;
