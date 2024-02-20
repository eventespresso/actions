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
exports.warnForSpawnSync = exports.logForSpawnSync = exports.infoForSpawnSync = exports.errorForSpawnSync = exports.warn = exports.log = exports.info = exports.error = exports.cwd = exports.absPath = exports.annotation = exports.command = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = __importDefault(require("node:process"));
const core = __importStar(require("@actions/core"));
const node_child_process_1 = __importDefault(require("node:child_process"));
/**
 * Check if the given binary is installed
 * @link https://askubuntu.com/questions/512770/what-is-the-bash-command-command
 * @param binary Absolute path to a binary file
 * @param group GitHub notice group (optional)
 * @returns
 */
// LATER: refactor to use SpawnSync.ts for improved error handling
function command(binary) {
    const bin = 'command';
    const args = ['-v', binary];
    const options = { stdio: 'pipe', encoding: 'utf-8', shell: true };
    const command = node_child_process_1.default.spawnSync(bin, args, options);
    if (command.status !== 0) {
        error(`Did not find installed binary for '${binary}'!`);
        return false;
    }
    return true;
}
exports.command = command;
/**
 * Create a GitHub annotation
 * @link https://github.com/actions/toolkit/tree/main/packages/core#logging
 */
function annotation(message, options = { type: 'error' }) {
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
exports.annotation = annotation;
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
/**
 * Flatten given string or an array of strings using newline as a glue
 */
function string(string) {
    return Array.isArray(string) ? string.join('\n') : string;
}
function _log(message, type) {
    console[type](string(message));
}
function error(...message) {
    _log(message, 'error');
}
exports.error = error;
/**
 * Alias for log()
 */
function info(...message) {
    _log(message, 'info');
}
exports.info = info;
function log(...message) {
    _log(message, 'log');
}
exports.log = log;
/**
 * Alias for error()
 */
function warn(...message) {
    _log(message, 'warn');
}
exports.warn = warn;
/**
 * Make sure stderr is always a string as it could be null
 * @link https://nodejs.org/docs/latest-v16.x/api/child_process.html#subprocessstderr
 */
function stderrToString(stderr) {
    if (!stderr) {
        return '';
    }
    return stderr.toString();
}
/**
 * Make sure stdout is always a string as it could be null
 * @link https://nodejs.org/docs/latest-v16.x/api/child_process.html#subprocessstdout
 */
function stdoutToString(stdout) {
    if (!stdout) {
        return '';
    }
    return stdout.toString();
}
/**
 * Convert output of command() function to a log message (single string)
 */
function spawnSyncToString(spawnSync) {
    const array = [];
    const stderr = stderrToString(spawnSync.stderr);
    if (stderr.length) {
        array.push('Stderr: ' + spawnSync.stderr.toString());
    }
    const stdout = stdoutToString(spawnSync.stdout);
    if (stdout.length) {
        array.push('Stdout: ' + stdout);
    }
    if (spawnSync.error) {
        array.push(spawnSync.error.name + ': ' + spawnSync.error.message);
    }
    if (spawnSync.signal) {
        array.push('Signal used to kill the subprocess: ' + spawnSync.signal.toString());
    }
    if (spawnSync.status) {
        array.push('Exit code of the subprocess: ' + spawnSync.status.toString());
    }
    return string(array);
}
function errorForSpawnSync(spawnSync, ...message) {
    error(string(message), spawnSyncToString(spawnSync));
}
exports.errorForSpawnSync = errorForSpawnSync;
/**
 * Alias for logForSpawnSync()
 */
function infoForSpawnSync(spawnSync, ...message) {
    info(string(message), spawnSyncToString(spawnSync));
}
exports.infoForSpawnSync = infoForSpawnSync;
function logForSpawnSync(spawnSync, ...message) {
    log(string(message), spawnSyncToString(spawnSync));
}
exports.logForSpawnSync = logForSpawnSync;
/**
 * Alias for errorForSpawnSync()
 */
function warnForSpawnSync(spawnSync, message) {
    warn(string(message), spawnSyncToString(spawnSync));
}
exports.warnForSpawnSync = warnForSpawnSync;
