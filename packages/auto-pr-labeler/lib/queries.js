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
exports.getPullRequest = exports.getLabels = void 0;
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const getLabels = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, utils_1.graphqlWithAuth)(`
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
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
exports.getLabels = getLabels;
const getPullRequest = (pr) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, utils_1.graphqlWithAuth)(`
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
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
exports.getPullRequest = getPullRequest;
