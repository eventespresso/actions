"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequest = exports.getLabels = void 0;
const utils_1 = require("./utils");
const getLabels = () => {
    return (0, utils_1.graphqlWithAuth)(`
		query ($owner: String!, $repo: String!) {
			repository(name: $repo, owner: $owner) {
				labels(first: 100, orderBy: {direction:ASC, field: NAME}) {
					nodes {
					name
					id
					}
				}
			}
		}
	`);
};
exports.getLabels = getLabels;
const getPullRequest = (pr) => {
    return (0, utils_1.graphqlWithAuth)(`
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
		`, { pr });
};
exports.getPullRequest = getPullRequest;
