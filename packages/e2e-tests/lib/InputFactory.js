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
exports.InputFactory = void 0;
const core = __importStar(require("@actions/core"));
class InputFactory {
    cafeBranch() {
        return core.getInput('cafe_repo_branch', { required: true });
    }
    baristaBranch() {
        return core.getInput('barista_repo_branch', { required: false });
    }
    e2eBranch() {
        return core.getInput('e2e_tests_repo_branch', { required: true });
    }
    skipTests() {
        return core.getBooleanInput('skip_tests', { required: false });
    }
    gpgPassword() {
        return core.getInput('gpg_password', { required: false });
    }
    gpgCipher() {
        return core.getInput('gpg_cipher', { required: false });
    }
    ddevVersion() {
        const version = core.getInput('ddev_version', { required: false });
        if (!version) {
            return; // "Returns an empty string if the value is not defined."
        }
        const pattern = /([^\d.]+)/;
        const regex = new RegExp(pattern);
        if (regex.test(version)) {
            throw new Error('Use of wrong format for DDEV version!');
        }
        return version;
    }
}
exports.InputFactory = InputFactory;
