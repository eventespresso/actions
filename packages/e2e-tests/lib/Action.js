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
exports.Action = void 0;
const Repository_1 = require("./Repository");
const child_process = __importStar(require("child_process"));
class Action {
    constructor(inputs, repos) {
        this.inputs = inputs;
        this.repos = repos;
    }
    run() {
        const cafe = this.getCafe().clone();
        let barista = undefined;
        if (this.inputs.getBaristaRepoBranch()) {
            barista = this.getBarista().clone().exec('yarn install --frozen-lockfile').exec('yarn build');
        }
        this.installDependencies();
        const env = {};
        env['CAFE'] = cafe.cwd;
        if (barista) {
            env['BARISTA'] = barista.cwd;
        }
        // TODO: once e2e-tests package is extracted from Barista repository, update the .exec() command
        this.getE2E()
            .clone()
            .exec('yarn install --frozen-lockfile')
            .exec(`yarn workspace @eventespresso/e2e test`, env);
    }
    makeEnvVars(...repos) {
        return repos
            .filter((any) => {
            return typeof any === 'object' && any.constructor.name === Repository_1.Repository.name;
        })
            .map((r) => `${r.name}=${r.cwd}`)
            .join(' ');
    }
    getCafe() {
        return this.repos.cafe(this.inputs.getCafeRepoBranch());
    }
    getBarista() {
        return this.repos.barista(this.inputs.getBaristaRepoBranch());
    }
    getE2E() {
        return this.repos.e2e(this.inputs.getE2ETestsRepoBranch());
    }
    installDependencies() {
        const cmds = [
            'sudo apt-get install --yes libnss3-tools mkcert',
            'curl -fsSL https://ddev.com/install.sh | bash',
            'npx playwright install --with-deps',
        ];
        for (const cmd of cmds) {
            child_process.execSync(cmd);
        }
    }
}
exports.Action = Action;
