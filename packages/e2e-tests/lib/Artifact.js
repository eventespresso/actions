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
exports.Artifact = void 0;
const path = __importStar(require("node:path"));
const core = __importStar(require("@actions/core"));
const glob = __importStar(require("@actions/glob"));
const artifact = __importStar(require("@actions/artifact"));
class Artifact {
    constructor() {
        this.client = artifact.create();
    }
    /**
     * Save given files/folders as an GitHub artifact
     * @param input A path or an array of paths to files or directories
     * @parma workDir Working directory (absolute path) from where files/folders are upload (parent directory for the given input)
     * @param name Name under which artifact will be saved
     * @param days For how many days artifact will be kept
     * @returns True if artifact was saved and false otherwise
     */
    save(input, workDir, name, days) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield this.getFiles(input, workDir);
            // no need to abort CI runner if artifact upload fails
            // this method returns true/false which allows the invoking
            // code to decide if process should be stopped or not
            const options = { continueOnError: true, retentionDays: days };
            if (files.length === 0) {
                core.notice(`Given artifact input '${this.inputToStr(input)}' is empty following working directory '${workDir}'`);
                return false;
            }
            let upload = undefined;
            try {
                upload = yield this.client.uploadArtifact(name, files, workDir, options);
            }
            catch (error) {
                core.error(`Failed to save artifact '${name}', see below for details`);
                core.error(`${error}`);
                return false;
            }
            if (upload.failedItems.length > 0) {
                const failed = upload.failedItems.join('\n');
                core.error(`Failied to upload some files for artifact '${name}':\n${failed}`);
                return false;
            }
            return true;
        });
    }
    /**
     * Convert given input string or array of inputs to string
     */
    inputToStr(input) {
        if (typeof input === 'string') {
            return input;
        }
        return input.join(', ');
    }
    /**
     * Convert given path(s) of whatever (files/folders) to an array of individual files with absolute path
     */
    getFiles(input, workDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrInput = this.inputToArr(input);
            const absInput = arrInput.map((i) => this.absPath(i, workDir));
            const promises = absInput.map((i) => this.inputToFiles(i));
            const files = yield Promise.all(promises);
            return files.flat();
        });
    }
    /**
     * Ensure that given input is always returned as an array
     */
    inputToArr(input) {
        if (typeof input === 'string') {
            return [input];
        }
        return input;
    }
    /**
     * Convert given input (assuming with pattern) to array of individuals files
     */
    inputToFiles(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (input.slice(-1) !== '*') {
                // if no pattern is present, there is nothing to be globbed
                return [input];
            }
            return (yield glob.create(input)).glob();
        });
    }
    /**
     * Ensure given path is always absolute
     */
    absPath(input, workDir) {
        if (input[0] === '/') {
            // input is already absolute, nothing to be done
            return input;
        }
        return path.resolve(workDir, input);
    }
}
exports.Artifact = Artifact;
