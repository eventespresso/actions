"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const SpawnSync_1 = require("./SpawnSync");
class Context {
    constructor(repo, cache, yarn, git) {
        this.repo = repo;
        this.cache = cache;
        this.yarn = yarn;
        this.git = git;
        this.spawnSync = new SpawnSync_1.SpawnSync(repo.cwd);
    }
    get cwd() {
        return this.repo.cwd;
    }
    call(command, args = [], opts = {}) {
        return this.spawnSync.call(command, args, opts);
    }
}
exports.Context = Context;
