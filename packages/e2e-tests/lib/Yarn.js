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
exports.Yarn = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const glob = __importStar(require("@actions/glob"));
const artifact = __importStar(require("@actions/artifact"));
class Yarn {
    constructor(repo, spawnSync, cache) {
        this.repo = repo;
        this.spawnSync = spawnSync;
        this.cache = cache;
    }
    install({ frozenLockfile }) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = ['install'];
            if (frozenLockfile) {
                args.push('--frozen-lockfile');
            }
            yield this.call(args, ['node_modules', '*/node_modules']);
            return this;
        });
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.call(['build'], ['build']);
            return this;
        });
    }
    test(envVars) {
        return __awaiter(this, void 0, void 0, function* () {
            const caRoot = this.spawnSync.call('mkcert', ['-CAROOT'], { stdout: 'pipe' }).stdout.trim();
            const reportPath = path.resolve(os.tmpdir(), 'playwright-report');
            const env = Object.assign({ NODE_EXTRA_CA_CERTS: `${caRoot}/rootCA.pem`, PLAYWRIGHT_HTML_REPORT: reportPath }, envVars);
            // if docker cache will become available, restore should be called here
            const buffer = this.spawnSync.call('yarn', ['playwright', 'test'], {
                env,
            });
            // if docker cache will become available, save should be called here
            if (buffer.status !== 0) {
                yield this.saveTestReport(reportPath);
            }
            return this;
        });
    }
    saveTestReport(reportPath) {
        return __awaiter(this, void 0, void 0, function* () {
            core.notice(`Attempting to save Playwright report from '${reportPath}'`);
            const client = artifact.create();
            const pattern = '**/*';
            const resolvedPath = path.resolve(reportPath, pattern);
            const globber = yield glob.create(resolvedPath);
            const files = yield globber.glob();
            if (files.length === 0) {
                core.notice(`Did not find any files matching pattern '${pattern}' at path '${resolvedPath}'`);
                return;
            }
            // include workflow # as well as attempt # in the report (artifact) filename
            const reportName = `playwright-report-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;
            let response = undefined;
            try {
                response = yield client.uploadArtifact(reportName, files, reportPath, {
                    continueOnError: true,
                    retentionDays: 7, // no need to cache artifacts for too long as after the test fails, the expectation is to fix it
                });
            }
            catch (error) {
                core.error(error);
                return;
            }
            if (response.failedItems.length > 0) {
                core.error(`Failed to upload some artifact items: \n${response.failedItems.join(', ')}`);
            }
        });
    }
    /**
     * Bind Yarn cache to sha256 of `package.json` and `yarn.lock` as output/outcome of commands may change when dependencies change
     * @param action Yarn action we are running
     * @returns Promise with cache key as string
     */
    makeCacheKey(action) {
        return __awaiter(this, void 0, void 0, function* () {
            const manifest = yield this.getFileSha256('package.json');
            const lockfile = yield this.getFileSha256('yarn.lock');
            return `${action}-${manifest}-${lockfile}`;
        });
    }
    /**
     * Get SHA-256 of the file relative to the root of the repository
     */
    getFileSha256(file) {
        return glob.hashFiles(path.resolve(this.repo.cwd, file), this.repo.cwd);
    }
    /**
     * Bind cache to specific commands to avoid collisions and ensure each Yarn command is saved under unique cache as we are working with 3 different repositories
     * @param args arguments for Yarn cli command
     * @param paths array of path to be cached (relative or absolute)
     * @returns empty Promise
     */
    call(args, paths) {
        return __awaiter(this, void 0, void 0, function* () {
            // in case of relative paths, resolve it into absolute path against cwd
            paths = paths.map((p) => path.resolve(this.repo.cwd, p));
            const action = `yarn-${args.join('-')}`;
            const key = yield this.makeCacheKey(action);
            const cache = yield this.cache.restore(key, paths);
            // if cache was found, the *outcome* of the command was cached
            // so there is no need to waste cpu cycles running it again
            if (cache) {
                core.info(`Found yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);
                return;
            }
            core.notice(`Did not find yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);
            this.spawnSync.call('yarn', args);
            yield this.cache.save(key, paths);
        });
    }
}
exports.Yarn = Yarn;
