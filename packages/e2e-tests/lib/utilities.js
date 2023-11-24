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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cwd = exports.absPath = exports.log = exports.logSpawnSyncError = exports.command = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const core = __importStar(require("@actions/core"));
const node_child_process_1 = __importDefault(require("node:child_process"));
function command(binary, group) {
    const bin = 'command';
    const args = ['-v', binary];
    const options = { stdio: 'pipe', encoding: 'utf-8', shell: true };
    const command = node_child_process_1.default.spawnSync(bin, args, options);
    if (command.status !== 0) {
        if (group) {
            core.startGroup(group);
        }
        core.error(`Did not find installed binary for '${binary}'!`);
        if (group) {
            core.endGroup();
        }
        return false;
    }
    return true;
}
exports.command = command;
function logSpawnSyncError({ command, group, message, }) {
    if (group) {
        core.startGroup(group);
    }
    if (message) {
        core.error(message);
    }
    core.error('Stderr: ' + command.stderr);
    core.error('Signal: ' + command.signal);
    core.error('Status: ' + command.status);
    if (command.error) {
        core.error('Error: ' + command.error.message);
    }
    if (group) {
        core.endGroup();
    }
}
exports.logSpawnSyncError = logSpawnSyncError;
function log(message, options = { type: 'error' }) {
    var _a;
    const type = (_a = options.type) !== null && _a !== void 0 ? _a : 'error';
    const group = options.group;
    if (group) {
        core.startGroup(group);
    }
    if (typeof message === 'string') {
        core[type](message);
    }
    if (Array.isArray(message)) {
        message.forEach((m) => core[type](m));
    }
    if (group) {
        core.endGroup();
    }
}
exports.log = log;
function absPath(source) {
    if (node_path_1.default.isAbsolute(source)) {
        return source;
    }
    return node_path_1.default.resolve(cwd(), source);
}
exports.absPath = absPath;
/**
 * Return current working directory of the command line
 * @link https://stackoverflow.com/a/12239689/4343719
 */
function cwd() {
    return node_process_1.default.cwd();
}
exports.cwd = cwd;
