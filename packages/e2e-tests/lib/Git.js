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
exports.Git = void 0;
const Cache_1 = require("./Cache");
const SpawnSync_1 = require("./SpawnSync");
const core = __importStar(require("@actions/core"));
class Git {
    constructor(repo) {
        this.repo = repo;
        this.spawnSync = new SpawnSync_1.SpawnSync(repo.cwd);
        this.cache = new Cache_1.Cache(repo);
    }
    clone() {
        return __awaiter(this, void 0, void 0, function* () {
            const sha = this.getLastCommitSha();
            const key = `git-clone-${sha}`;
            const cloneFromRemote = () => {
                this.spawnSync.call('git', [
                    'clone',
                    '--branch',
                    this.repo.branch,
                    '--single-branch',
                    '--no-tags',
                    this.repo.remote,
                    this.repo.cwd,
                ]);
            };
            const cloneFromCache = () => {
                return this.cache.restore(key, [this.repo.cwd]);
            };
            if (yield cloneFromCache()) {
                core.info(`Found git repository '${this.repo.name}' in cache`);
                return this;
            }
            core.notice(`Did not find git repository '${this.repo.name}' in cache, cloning from remote`);
            cloneFromRemote();
            yield this.cache.save(key, [this.repo.cwd]);
            return this;
        });
    }
    getLastCommitSha() {
        // courtesy of https://stackoverflow.com/a/15679887/4343719
        const ref = `refs/heads/${this.repo.branch}`;
        // courtesy of https://stackoverflow.com/a/24750310/4343719
        const git = this.spawnSync.call('git', ['ls-remote', this.repo.remote, ref], {
            stdout: 'pipe',
        });
        // courtesy of https://stackoverflow.com/a/24750310/4343719
        const cut = this.spawnSync.call('cut', ['-f', '1'], { input: git.stdout, stdin: 'pipe', stdout: 'pipe' });
        const sha = cut.stdout;
        if (!sha || sha.length === 0) {
            core.setFailed(`Failed to obtain latest commit sha for repository '${this.repo.name}' for branch '${this.repo.branch}' \ngit refs: \n${git.stdout} \ncut outcome: ${sha}`);
        }
        return sha;
    }
}
exports.Git = Git;
