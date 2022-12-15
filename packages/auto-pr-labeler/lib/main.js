"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const mutations_1 = require("./mutations");
const queries_1 = require("./queries");
const assignStatusLabelsToPullRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const results = yield (0, queries_1.getPullRequest)(utils_1.pr);
        // eslint-disable-next-line no-console
        console.log('%c pull request query results', 'color: cyan;', results);
        if (((_a = results === null || results === void 0 ? void 0 : results.repository) === null || _a === void 0 ? void 0 : _a.pullRequest) && results.repository.pullRequest !== null) {
            (0, mutations_1.assignStatusLabels)(utils_1.repo, results.repository.pullRequest);
        }
        else {
            throw new Error(`Could not retrieve a valid Pull Request with ID: ${utils_1.pr}`);
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
});
exports.default = assignStatusLabelsToPullRequest;
