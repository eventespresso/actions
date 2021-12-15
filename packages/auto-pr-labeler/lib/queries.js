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
const utils_1 = require("./utils");
const getLabels = (org, repo, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, utils_1.graphqlWithAuth)(token)(`
		query ($org: String!, $repo: String!) {
			repository(name: $repo, owner: $org) {
				labels(first: 100, orderBy: {direction:ASC, field: NAME}) {
					nodes {
					name
					id
					}
				}
			}
		}
	`, 
    // ex: {"org": "eventespresso", "repo":"barista"}
    { org, repo });
});
exports.getLabels = getLabels;
const getPullRequest = (org, repo, pr, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, utils_1.graphqlWithAuth)(token)(`
			query ($pr: Int!, $org: String!, $repo: String!) {
				repository(name: $repo, owner: $org) {
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
		`, 
    // ex: {"org": "eventespresso", "repo":"barista", "pr":1098}
    { org, repo, pr });
});
exports.getPullRequest = getPullRequest;
