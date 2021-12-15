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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mutations_1 = require("./mutations");
const core_1 = __importDefault(require("@actions/core"));
const queries_1 = require("./queries");
const assignStatusLabelsToPullRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    const org = core_1.default.getInput('org', { required: true }) || 'eventespresso';
    const repo = core_1.default.getInput('repo', { required: true }) || 'barista';
    const pr = Number(core_1.default.getInput('pr', { required: true }));
    const token = core_1.default.getInput('token', { required: true });
    // eslint-disable-next-line no-console
    console.log('%c organization', 'color: LimeGreen;', org);
    // eslint-disable-next-line no-console
    console.log('%c repository', 'color: Yellow;', pr);
    // eslint-disable-next-line no-console
    console.log('%c pull request #', 'color: HotPink;', pr);
    const { pullRequest } = yield (0, queries_1.getPullRequest)(org, repo, pr, token);
    if (pullRequest) {
        (0, mutations_1.assignStatusLabels)(pullRequest, token);
    }
});
try {
    assignStatusLabelsToPullRequest();
}
catch (error) {
    core_1.default.setFailed(error.message);
}
