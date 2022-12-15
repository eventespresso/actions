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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gqlVariables = exports.pr = exports.repo = void 0;
const core = __importStar(require("@actions/core"));
const owner = core.getInput('owner', { required: true });
const token = core.getInput('token', { required: true });
exports.repo = core.getInput('repo', { required: true });
exports.pr = Number(core.getInput('prNumber', { required: true }));
// eslint-disable-next-line no-console
console.log('%c organization', 'color: LimeGreen;', owner);
// eslint-disable-next-line no-console
console.log('%c repository', 'color: Yellow;', exports.repo);
// eslint-disable-next-line no-console
console.log('%c pull request #', 'color: HotPink;', exports.pr);
const headers = {
    'Content-Type': 'application/json',
    Authorization: `bearer ${token}`,
};
exports.gqlVariables = { owner, repo: exports.repo, headers };
