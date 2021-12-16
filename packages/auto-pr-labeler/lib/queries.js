"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequest = exports.getLabels = void 0;
const utils_1 = require("./utils");
const graphql_1 = require("@octokit/graphql");
const getLabels = () => {
    return (0, graphql_1.graphql)(`
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
};
exports.getLabels = getLabels;
const getPullRequest = (pr) => {
    return (0, graphql_1.graphql)(`
			query ($pr: Int!, $owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					pullRequest(number: $pr) {
						id
						labels(first: 10) {
							nodes {
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
							}
						}
					}
				}
			}
		`, Object.assign({ pr }, utils_1.gqlVariables));
};
exports.getPullRequest = getPullRequest;
