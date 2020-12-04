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
exports.DEFAULT_VERSION_PARTS = exports.EE_VERSION_REGEX = exports.README_FILE_STABLE_TAG_REGEX = exports.MAIN_FILE_PLUGIN_NAME_REGEX = exports.MAIN_FILE_PLUGIN_URI_REGEX = exports.MAIN_FILE_VERSION_REGEX = exports.getInput = exports.releaseTypes = exports.bumpTypes = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@eventespresso-actions/io"));
exports.bumpTypes = ['major', 'minor', 'patch', 'release_type', 'build'];
exports.releaseTypes = ['alpha', 'beta', 'decaf', 'rc', 'p'];
/**
 * Retrieve the action inputs.
 */
function getInput() {
    const infoJsonFile = core.getInput('info-json-file', { required: true });
    const mainFile = core.getInput('main-file', { required: true });
    const readmeFile = core.getInput('readme-file', { required: true });
    const type = core.getInput('type', { required: true });
    const value = core.getInput('value');
    const releaseType = core.getInput('release-type');
    if (!io.existsSync(mainFile)) {
        throw new Error('Main file does not exist.');
    }
    if (!io.existsSync(infoJsonFile)) {
        throw new Error('info.json file does not exist.');
    }
    if (!io.existsSync(readmeFile)) {
        throw new Error('readme.txt file does not exist.');
    }
    if (!exports.bumpTypes.includes(type)) {
        throw new Error(`Unknown bump type - ${type}`);
    }
    if (releaseType && !exports.releaseTypes.includes(releaseType)) {
        throw new Error(`Unknown release type - ${releaseType}`);
    }
    return {
        infoJsonFile,
        mainFile,
        readmeFile,
        releaseType,
        type,
        value,
    };
}
exports.getInput = getInput;
exports.MAIN_FILE_VERSION_REGEX = /[\s\t/*#@]*Version:\s*(?<version>\S*)/i;
exports.MAIN_FILE_PLUGIN_URI_REGEX = /[\s\t/*#@]*Plugin URI:\s*(?<plugin_uri>\S+)/i;
exports.MAIN_FILE_PLUGIN_NAME_REGEX = /[\s\t/*#@]*Plugin Name:\s*(?<plugin_name>.+)/i;
exports.README_FILE_STABLE_TAG_REGEX = /[\s\t/*#@]*Stable tag:\s*(?<stable_tag>\S+)/i;
/**
 * The regex reperesenting the version schema used by EE.
 *
 * MAJOR    ([0-9]+)                  MUST match & capture a number
 * DOT      \.                        MUST match a period
 * MINOR    ([0-9]+)                  MUST match & capture a number
 * DOT      \.                        MUST match a period
 * PATCH    ([0-9]+)                  MUST match & capture a number
 * RELEASE  \.(alpha|beta|rc|p|decaf) optionally match a dot and one of values in brackets
 * BUILD    \.([0-9]*)                optionally match a dot & capture a number
 * @see: https://regex101.com/r/5nSgf3/1/
 */
exports.EE_VERSION_REGEX = /^(?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)(?:\.(?<releaseType>alpha|beta|rc|p|decaf))?(?:\.(?<build>[0-9]*))?$/;
exports.DEFAULT_VERSION_PARTS = {
    major: 0,
    minor: 0,
    patch: 0,
    releaseType: '',
    build: 0,
};
