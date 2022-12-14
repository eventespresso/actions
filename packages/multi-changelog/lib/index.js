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
const github = __importStar(require("@actions/github"));
const io_1 = require("@eventespresso-actions/io");
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const PAYLOAD = (_a = github.context) === null || _a === void 0 ? void 0 : _a.payload;
        // if (PAYLOAD.action !== 'closed' && PAYLOAD.pull_request.merged !== true) {
        // 	return;
        // }
        const repo = (_c = (_b = github.context) === null || _b === void 0 ? void 0 : _b.repo) === null || _c === void 0 ? void 0 : _c.repo;
        const owner = (_e = (_d = github.context) === null || _d === void 0 ? void 0 : _d.repo) === null || _e === void 0 ? void 0 : _e.owner;
        if (!repo || !owner) {
            core.setFailed(`WUT?!?! The repo and/or owner data is missing from the payload?!?!? `);
        }
        const pullRequest = PAYLOAD.pull_request;
        const base = (_f = pullRequest.base) === null || _f === void 0 ? void 0 : _f.sha;
        const head = (_g = pullRequest.head) === null || _g === void 0 ? void 0 : _g.sha;
        if (!base || !head) {
            core.setFailed(`OH NOES?!?! The base and head commits are missing from the payload?!?!? `);
        }
        const GITHUB_TOKEN = core.getInput('token', { required: true });
        const octokit = github.getOctokit(GITHUB_TOKEN);
        // https://developer.github.com/v3/repos/commits/#compare-two-commits
        const comparison = yield octokit.rest.repos.compareCommits({
            owner,
            repo,
            base,
            head,
        });
        if ((comparison === null || comparison === void 0 ? void 0 : comparison.status) !== 200) {
            core.setFailed(`GitHub.repos.compareCommits() failed for commits base: ${base} and head: ${head}`);
        }
        if (comparison.data.status !== 'ahead') {
            core.setFailed('The BASE is ahead of HEAD but HEAD should be ahead of BASE!?!?.');
        }
        const files = comparison.data.files;
        const plugins = [];
        let pathParts;
        let pluginName;
        for (const file of files) {
            // plugins/eea-wait-lists/acceptance_tests/Page/WaitListsGeneral.php
            pathParts = file.filename.split('/');
            core.info(`filename: ${file.filename}`);
            if (pathParts[0] === 'plugins' && pathParts[1] !== undefined) {
                pluginName = pathParts[1];
                if (!plugins.includes(pluginName)) {
                    plugins.push(pluginName);
                    core.info(`plugin: ${pluginName}`);
                }
            }
        }
        let changelogPath;
        let changelogEntry;
        let changelogContents;
        const PLACEHOLDER = '<changelog_entry>';
        for (const plugin of plugins) {
            changelogContents = PLACEHOLDER;
            changelogPath = `plugins/${plugin}/CHANGELOG.md`;
            core.info(`changelogPath: ${changelogPath}`);
            if ((0, io_1.existsSync)(changelogPath)) {
                changelogContents = (0, io_1.readFileSync)(changelogPath, { encoding: 'utf8' });
            }
            changelogEntry = pullRequest.title;
            core.info(`changelogEntry: ${changelogEntry}`);
            changelogEntry += PLACEHOLDER;
            changelogContents = changelogContents.replace(PLACEHOLDER, changelogEntry);
            (0, io_1.writeFileSync)(changelogPath, changelogContents, { encoding: 'utf8' });
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}))();
