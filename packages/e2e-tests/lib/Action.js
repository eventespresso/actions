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
exports.Action = void 0;
const Browsers_1 = require("./Browsers");
const utilities_1 = require("./utilities");
const core = __importStar(require("@actions/core"));
class Action {
    constructor(inputs, contexts, spawnSync) {
        this.inputs = inputs;
        this.contexts = contexts;
        this.spawnSync = spawnSync;
        this.browsers = new Browsers_1.Browsers(this.spawnSync);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const cafe = this.contexts.make('cafe', this.inputs.cafeBranch());
            const barista = this.contexts.make('barista', this.inputs.baristaBranch());
            const e2e = this.contexts.make('e2e', this.inputs.e2eBranch());
            const skipTests = this.inputs.skipTests();
            const skipBarista = this.inputs.baristaBranch().length === 0;
            yield cafe.git.clone();
            yield e2e.git.clone();
            if (!skipBarista) {
                yield barista.git.clone();
            }
            // requires repositories to be cloned first
            yield this.showGitSummary(skipBarista ? [cafe, e2e] : [cafe, barista, e2e]);
            yield e2e.yarn.install({ frozenLockfile: true });
            if (!skipBarista) {
                yield barista.yarn.install({ frozenLockfile: true });
                yield barista.yarn.build();
            }
            // install dependencies
            this.updateAptRepoIndex();
            this.mkcert();
            this.ddev();
            this.browsers.install(e2e);
            if (!skipTests) {
                yield e2e.yarn.setup(this.getEnvVars(cafe, barista));
                yield e2e.yarn.test(this.getEnvVars(cafe, barista));
            }
        });
    }
    showGitSummary(contexts) {
        return __awaiter(this, void 0, void 0, function* () {
            const repos = contexts.map((context) => {
                return context.repo;
            });
            // there is no ready-made way to include action commit sha in this table
            // reference: https://github.com/orgs/community/discussions/54516
            //            https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#github-context
            core.summary.addHeading('Git information', 2);
            core.summary.addTable([
                [
                    { data: 'Repo', header: true },
                    { data: 'Branch', header: true },
                    { data: 'Commit', header: true },
                ],
                ...repos.map((repo) => {
                    return [repo.name, repo.branch, repo.commit.substring(0, 7)];
                }),
            ]);
            yield core.summary.write();
        });
    }
    /**
     * @link [reference](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/customizing-github-hosted-runners#installing-software-on-ubuntu-runners)
     * @link [GitHub issue #61](https://github.com/eventespresso/actions/issues/61)
     */
    updateAptRepoIndex() {
        (0, utilities_1.log)('Updating apt repository index...');
        this.spawnSync.call('sudo', ['apt-get', 'update']);
    }
    mkcert() {
        (0, utilities_1.log)('Installing mkcert...');
        this.spawnSync.call('sudo', ['apt-get', 'install', '--yes', 'libnss3-tools', 'mkcert']);
    }
    getDdevVersion() {
        const version = this.inputs.ddevVersion();
        if (!version) {
            return;
        }
        return 'v' + version;
    }
    ddev() {
        (0, utilities_1.log)('Installing DDEV...');
        const curl = this.spawnSync.call('curl', ['-fsSL', 'https://ddev.com/install.sh'], { stdout: 'pipe' });
        const bashArgs = [];
        const ddevVersion = this.getDdevVersion();
        if (ddevVersion) {
            bashArgs.push('-s');
            bashArgs.push(ddevVersion);
        }
        this.spawnSync.call('bash', bashArgs, { stdin: 'pipe', input: curl.stdout });
    }
    getEnvVars(cafe, barista) {
        const vars = { CAFE: cafe.cwd };
        const baristaBranch = this.inputs.baristaBranch();
        if (baristaBranch.length > 0) {
            vars.BARISTA = barista.cwd;
        }
        return vars;
    }
}
exports.Action = Action;
