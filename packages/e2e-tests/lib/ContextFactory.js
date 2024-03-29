"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextFactory = void 0;
const Cache_1 = require("./Cache");
const Context_1 = require("./Context");
const SpawnSync_1 = require("./SpawnSync");
const Git_1 = require("./Git");
const Yarn_1 = require("./Yarn");
const Artifact_1 = require("./Artifact");
const Tar_1 = require("./Tar");
const GPG_1 = require("./GPG");
const InputFactory_1 = require("./InputFactory");
class ContextFactory {
    constructor(repos) {
        this.repos = repos;
    }
    make(type, branch) {
        const repo = this.repos[type](branch);
        const git = new Git_1.Git(repo);
        const cache = new Cache_1.Cache(repo);
        const spawn = new SpawnSync_1.SpawnSync(repo.cwd);
        const artifact = new Artifact_1.Artifact();
        const tar = new Tar_1.Tar();
        const inputs = new InputFactory_1.InputFactory();
        const gpg = new GPG_1.GPG(inputs);
        const yarn = new Yarn_1.Yarn(repo, spawn, cache, artifact, tar, gpg);
        return new Context_1.Context(repo, cache, yarn, git);
    }
}
exports.ContextFactory = ContextFactory;
