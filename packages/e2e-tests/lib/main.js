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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Repository_1 = require("./Repository");
const ChildProcess = __importStar(require("child_process"));
const core = __importStar(require("@actions/core"));
const e2eTests = () => {
    dotenv_1.default.config({
        path: '../.dotenv',
    });
    // ### prepare cafe repo
    const cafeEnv = core.getInput('cafe-repo');
    if (!cafeEnv) {
        throw new Error('Missing environment variable: CAFE');
    }
    const cafeRepo = new Repository_1.Repository({ name: 'cafe', localOrRemote: cafeEnv });
    // TODO: cache for composer deps here
    cafeRepo.exec('composer install');
    // ### prepare barista repo (optional)
    const baristaEnv = core.getInput('barista-repo');
    if (!baristaEnv) {
        throw new Error('Missing environment variable: BARISTA');
    }
    const baristaRepo = new Repository_1.Repository({ name: 'barista', localOrRemote: baristaEnv });
    // TODO:: barista can be optional as cafe contains all assets
    // TODO: cache for yarn deps here
    baristaRepo.exec('npm ci');
    baristaRepo.exec('yarn build');
    // ### prepare e2e tests repo
    const e2eTestsEnv = core.getInput('e2e-tests-repo');
    if (!e2eTestsEnv) {
        throw new Error('Missing environment variable: E2E_TESTS');
    }
    const e2eTestsRepo = new Repository_1.Repository({ name: 'e2e-tests', localOrRemote: e2eTestsEnv });
    e2eTestsRepo.exec('npm ci');
    // ### prepare environment
    ChildProcess.execSync('sudo apt-get install --yes mkcert');
    ChildProcess.execSync('curl -fsSL https://ddev.com/install.sh | bash');
    ChildProcess.execSync('npx playwright install --with-deps');
    // ### run actual tests
    e2eTestsRepo.exec('yarn test');
};
exports.default = e2eTests;
