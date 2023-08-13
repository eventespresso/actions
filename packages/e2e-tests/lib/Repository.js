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
exports.Repository = void 0;
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const Path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const ChildProcess = __importStar(require("child_process"));
class Repository {
    constructor(params) {
        const name = this.sanitizeName(params.name);
        const cwd = this.makeCwd(name);
        this.name = name;
        this.branch = params.branch;
        this.cwd = cwd;
        this.remote = params.remote;
    }
    makeCwd(name) {
        const cwd = Path.resolve(os.tmpdir(), name);
        this.checkPathAvailable(cwd);
        return cwd;
    }
    /**
     * Execute given command in working directory of the repository
     */
    exec(command, env = {}) {
        const outcome = ChildProcess.spawnSync(command, {
            shell: true,
            stdio: ['inherit', 'inherit', 'pipe'],
            cwd: this.cwd,
            env: Object.assign(Object.assign({}, process.env), env),
        });
        if (outcome.status !== 0) {
            const strArr = [`Failed to execute command: ${command}`, '\n', outcome.stderr.toString()];
            const msg = strArr.join('\n');
            core.setFailed(msg);
        }
        return this;
    }
    checkPathAvailable(path) {
        if (fs.existsSync(path)) {
            core.setFailed(`Given path already exists: \n${path}`);
        }
    }
    sanitizeName(name) {
        return name
            .toLowerCase() // all lower case, easy to work with cli
            .replaceAll(' ', '-') // no spaces
            .replaceAll(/[^a-z0-9]/g, ''); // only letters and digits
    }
    clone() {
        ChildProcess.execSync(`git clone --branch ${this.branch} --single-branch --no-tags ${this.remote} ${this.cwd}`);
        return this;
    }
}
exports.Repository = Repository;
