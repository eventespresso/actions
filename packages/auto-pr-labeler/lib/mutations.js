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
exports.removeLabelsMutation = exports.addLabelsMutation = void 0;
const graphql_1 = require("@octokit/graphql");
const utils_1 = require("./utils");
const addLabelsMutation = (labelIds, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, graphql_1.graphql)(`
			mutation ($labelIds: [ID!]!, $labelableId: ID!) {
				addLabelsToLabelable(input: { labelIds: $labelIds, labelableId: $labelableId }) {
					labelable {
						labels(first: 10) {
							nodes {
								name
							}
						}
					}
				}
			}
		`, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
});
exports.addLabelsMutation = addLabelsMutation;
const removeLabelsMutation = (labelIds, labelableId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, graphql_1.graphql)(`
			mutation ($labelIds: [ID!]!, $labelableId: ID!) {
				removeLabelsFromLabelable(input: { labelIds: $labelIds, labelableId: $labelableId }) {
					labelable {
						labels(first: 10) {
							nodes {
								name
							}
						}
					}
				}
			}
		`, Object.assign({ labelIds, labelableId }, utils_1.gqlVariables));
});
exports.removeLabelsMutation = removeLabelsMutation;
