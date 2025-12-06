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
const utilities_1 = require("./utilities");
const core = __importStar(require("@actions/core"));
const glob = __importStar(require("@actions/glob"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
class Yarn {
    constructor(repo, spawnSync, cache, artifact, tar, gpg) {
        this.repo = repo;
        this.spawnSync = spawnSync;
        this.cache = cache;
        this.artifact = artifact;
        this.tar = tar;
        this.gpg = gpg;
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
    makeEnvVars(envVars) {
        return __awaiter(this, void 0, void 0, function* () {
            const caRoot = yield this.spawnSync.call('mkcert', ['-CAROOT'], { stdout: 'pipe' }).stdout.trim();
            const { htmlReportPath } = this.getPlaywrightPaths();
            const envBase = {
                NODE_EXTRA_CA_CERTS: `${caRoot}/rootCA.pem`,
                PLAYWRIGHT_HTML_REPORT: htmlReportPath,
            };
            return Object.assign(Object.assign({}, envBase), envVars);
        });
    }
    getPlaywrightPaths() {
        const htmlReportPath = path.resolve(os.tmpdir(), 'playwright-report');
        const resultsPath = path.resolve(os.tmpdir(), 'playwright-test-results');
        return { htmlReportPath, resultsPath };
    }
    /**
     * Runs the given `npmScript`
     * (assumes will call Playwright, special logic for saving Playwright artifacts)
     */
    runPlaywrightAsNpmScript(npmScript, envVars) {
        return __awaiter(this, void 0, void 0, function* () {
            const env = yield this.makeEnvVars(envVars);
            const { resultsPath, htmlReportPath } = this.getPlaywrightPaths();
            // if docker cache will become available, restore should be called here
            const buffer = this.spawnSync.call('yarn', [npmScript, `--output=${resultsPath}`], {
                env,
                noAnnotation: true,
                noException: true, // required to save artifact
            });
            // if docker cache will become available, save should be called here
            if (buffer.status !== 0) {
                if (fs.existsSync(htmlReportPath))
                    yield this.saveHtmlReport(htmlReportPath);
                if (fs.existsSync(resultsPath))
                    yield this.saveTestResults(resultsPath);
                core.setFailed(`NPM script '${npmScript}' did not pass successfully!`);
                // throw the error to terminate the script; `core.setFailed` does NOT terminate script's execution!
                throw new Error(`NPM script '${npmScript}' has failed!`, { cause: buffer.stderr });
            }
            return this;
        });
    }
    setup(envVars) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runPlaywrightAsNpmScript('setup', envVars);
        });
    }
    test(envVars) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runPlaywrightAsNpmScript('test', envVars);
        });
    }
    saveArtifact(file, report) {
        if (!fs.existsSync(file)) {
            (0, utilities_1.error)('Cannot save artifact at the given path as the file is not found!', 'File path: ' + file);
            return false;
        }
        const tarball = this.tar.create(file);
        if (!tarball) {
            return false;
        }
        const gpg = this.gpg.encrypt(tarball);
        if (!gpg) {
            return false;
        }
        const fileName = path.basename(gpg);
        const rootDir = path.dirname(gpg);
        return this.artifact.save(fileName, rootDir, report.name, report.expiry);
    }
    saveHtmlReport(reportPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // include workflow # as well as attempt # in the report (artifact) filename
            const name = `playwright-report-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;
            const expiry = 7; // days
            return yield this.saveArtifact(reportPath, { name, expiry });
        });
    }
    saveTestResults(resultsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // include workflow # as well as attempt # in results (artifact) filename
            const name = `playwright-test-results-run-${process.env.GITHUB_RUN_NUMBER}-attempt-${process.env.GITHUB_RUN_ATTEMPT}`;
            const expiry = 7; // days
            return yield this.saveArtifact(resultsPath, { name, expiry });
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
                (0, utilities_1.log)(`Found yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);
                return;
            }
            (0, utilities_1.log)(`Did not find yarn cache for command 'yarn ${args.join(' ')}' in git repository '${this.repo.name}'`);
            this.spawnSync.call('yarn', args);
            yield this.cache.save(key, paths);
        });
    }
}
exports.Yarn = Yarn;
