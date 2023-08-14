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
const child_process = __importStar(require("child_process"));
class Action {
    constructor(inputs, repos) {
        this.inputs = inputs;
        this.repos = repos;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const cafe = this.getCafe();
            const barista = this.getBarista();
            const e2e = this.getE2E();
            yield cafe.clone();
            // it is optional to clone barista repo
            if (this.inputs.getBaristaRepoBranch()) {
                yield barista.clone();
                barista.exec('yarn install --frozen-lockfile');
                barista.exec('yarn build');
            }
            this.installDependencies();
            const env = {};
            env['CAFE'] = cafe.cwd;
            if (barista) {
                env['BARISTA'] = barista.cwd;
            }
            yield e2e.clone();
            // TODO: once e2e-tests package is extracted from Barista repository, update the .exec() command
            e2e.exec('yarn install --frozen-lockfile');
            e2e.exec(`yarn workspace @eventespresso/e2e test`, env);
        });
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
