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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gqlVariables = exports.pr = void 0;
const core = __importStar(require("@actions/core"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const ownerRepo = process.env.GITHUB_REPOSITORY;
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require
const eventPayload = require(process.env.GITHUB_EVENT_PATH);
// eslint-disable-next-line no-console
console.log('%c eventPayload?.owner', 'color: LimeGreen;', eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.owner);
// eslint-disable-next-line no-console
console.log('%c eventPayload?.repo', 'color: LimeGreen;', eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.repo);
// eslint-disable-next-line no-console
console.log('%c ownerRepo', 'color: LimeGreen;', ownerRepo);
// const owner = core.getInput('owner', { required: true });
// const owner = core.getInput('owner', { required: true });
const token = core.getInput('token', { required: true });
// export const pr = Number(core.getInput('prNumber', { required: true }));
const owner = eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.owner;
const repo = eventPayload === null || eventPayload === void 0 ? void 0 : eventPayload.repo;
exports.pr = Number(eventPayload.issue.number);
// eslint-disable-next-line no-console
console.log('%c organization', 'color: LimeGreen;', owner);
// eslint-disable-next-line no-console
console.log('%c repository', 'color: Yellow;', repo);
// eslint-disable-next-line no-console
console.log('%c pull request #', 'color: HotPink;', exports.pr);
const headers = {
    'Content-Type': 'application/json',
    authorization: `Bearer ${token}`,
};
exports.gqlVariables = { owner, repo, headers };
