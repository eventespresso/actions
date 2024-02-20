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
const utilities_1 = require("./utilities");
const os = __importStar(require("node:os"));
const fs = __importStar(require("node:fs"));
const Path = __importStar(require("node:path"));
class Repository {
    set commit(sha) {
        this._commit = sha;
    }
    get commit() {
        return this._commit;
    }
    constructor(params) {
        this._commit = '❌';
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
    checkPathAvailable(path) {
        if (fs.existsSync(path)) {
            (0, utilities_1.error)(`Cannot perform 'git clone' as the destination path already exists!`, 'Path: ' + path);
            (0, utilities_1.annotation)('Cannot clone repository! (click for more details)');
            throw new Error();
        }
    }
    sanitizeName(name) {
        return name
            .toLowerCase() // all lower case, easy to work with cli
            .replaceAll(' ', '-') // no spaces
            .replaceAll(/[^a-z0-9-]/g, ''); // only letters, digits, and dash (hyphen)
    }
}
exports.Repository = Repository;
