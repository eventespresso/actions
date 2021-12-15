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
const core = __importStar(require("@actions/core"));
const mutations_1 = require("./mutations");
const queries_1 = require("./queries");
try {
    const assignStatusLabelsToPullRequest = () => __awaiter(void 0, void 0, void 0, function* () {
        const org = core.getInput('org', { required: true }) || 'eventespresso';
        const repo = core.getInput('repo', { required: true }) || 'barista';
        const pr = Number(core.getInput('pr', { required: true }));
        const token = core.getInput('token', { required: true });
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
    assignStatusLabelsToPullRequest();
}
catch (error) {
    core.setFailed(error.message);
}
