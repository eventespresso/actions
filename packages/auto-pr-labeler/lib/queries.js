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
exports.getPullRequest = exports.getLabels = void 0;
const graphql_1 = require("@octokit/graphql");
const utils_1 = require("./utils");
const getLabels = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, graphql_1.graphql)(`
			query ($owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					labels(first: 100, orderBy: { direction: ASC, field: NAME }) {
						nodes {
							name
							id
						}
					}
				}
			}
		`, utils_1.gqlVariables);
});
exports.getLabels = getLabels;
const getPullRequest = (pr) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, graphql_1.graphql)(`
			query ($pr: Int!, $owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					pullRequest(number: $pr) {
						id
						labels(first: 10) {
							nodes {
								id
								name
							}
						}
						number
						reviewDecision
						state
						closingIssuesReferences(first: 10) {
							nodes {
								id
								number
								title
							}
							totalCount
						}
						reviewRequests(first: 10) {
							totalCount
						}
						assignees(first: 10) {
							nodes {
								login
								id
							}
						}
					}
				}
			}
		`, Object.assign({ pr }, utils_1.gqlVariables));
});
exports.getPullRequest = getPullRequest;
