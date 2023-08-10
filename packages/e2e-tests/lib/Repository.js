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
const ChildProcess = __importStar(require("child_process"));
class Repository {
    constructor(params) {
        this.name = this.sanitizeName(params.name);
        this.cwd = this.determineCwd(params.localOrRemote);
    }
    exec(command) {
        ChildProcess.spawnSync(command, {
            shell: true,
            stdio: 'inherit',
            cwd: this.cwd,
        });
    }
    getCwd() {
        // conceal cwd behind method to enforce validation
        return this.cwd;
    }
    determineCwd(localOrRemote) {
        const type = this.getType(localOrRemote);
        if (type === 'local')
            return this.checkPath(localOrRemote);
        if (type === 'remote')
            return this.clone(localOrRemote);
        throw new Error(`Unknown git repository format: \n${localOrRemote}`);
    }
    checkPath(path) {
        if (!fs.existsSync(path)) {
            throw new Error(`Path does not exist: \n${path}`);
        }
        return path;
    }
    getType(localOrRemote) {
        if (localOrRemote.startsWith('https://'))
            return 'remote';
        if (localOrRemote.endsWith('.git'))
            return 'remote';
        if (localOrRemote.startsWith('.'))
            return 'local';
        if (localOrRemote.startsWith('/'))
            return 'local';
        throw new Error(`Unsupported git path: \n${localOrRemote}`);
    }
    sanitizeName(name) {
        return name
            .toLowerCase() // all lower case, easy to work with cli
            .replaceAll(' ', '-') // no spaces
            .replaceAll(/[^a-z0-9]/, ''); // only letters and digits
    }
    /**
     * @return local path to repository
     */
    clone(remote) {
        const path = this.getPath(this.name);
        const cmd = `git clone ${remote} ${path}`;
        ChildProcess.execSync(cmd);
        return path;
    }
    getPath(subpath) {
        return Path.resolve(os.tmpdir(), subpath !== null && subpath !== void 0 ? subpath : '');
    }
}
exports.Repository = Repository;
