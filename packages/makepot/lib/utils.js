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
exports.getInput = void 0;
const core = __importStar(require("@actions/core"));
/**
 * Retrieve the action inputs.
 */
function getInput() {
    const exclude = core.getInput('exclude');
    const headers = core.getInput('headers');
    const include = core.getInput('include');
    const ignoreDomain = Boolean(core.getInput('ignore-domain'));
    const packageName = core.getInput('package-name');
    const savePath = core.getInput('save-path', { required: true });
    const slug = core.getInput('slug', { required: true });
    const textDomain = core.getInput('text-domain') || slug;
    const headersJsonFile = core.getInput('headers-json-file');
    return {
        exclude,
        headers,
        headersJsonFile,
        ignoreDomain,
        include,
        packageName,
        savePath,
        slug,
        textDomain,
    };
}
exports.getInput = getInput;
