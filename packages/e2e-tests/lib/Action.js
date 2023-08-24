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
const core = __importStar(require("@actions/core"));
const Browsers_1 = require("./Browsers");
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
            yield cafe.git.clone();
            // it is optional to clone barista repo
            if (this.inputs.baristaBranch()) {
                yield barista.git.clone();
                yield barista.yarn.install({ frozenLockfile: true });
                yield barista.yarn.build();
            }
            yield e2e.git.clone();
            yield e2e.yarn.install({ frozenLockfile: true });
            // install dependencies
            this.mkcert();
            this.ddev();
            this.browsers.install(e2e);
            if (!skipTests) {
                yield e2e.yarn.test(this.getEnvVars(cafe, barista));
            }
        });
    }
    mkcert() {
        core.info('Installing mkcert');
        this.spawnSync.call('sudo', ['apt-get', 'install', '--yes', 'libnss3-tools', 'mkcert']);
    }
    ddev() {
        core.info('Installing DDEV');
        const curl = this.spawnSync.call('curl', ['-fsSL', 'https://ddev.com/install.sh'], { stdout: 'pipe' });
        this.spawnSync.call('bash', [], { stdin: 'pipe', input: curl.stdout });
    }
    getEnvVars(cafe, barista) {
        const vars = { CAFE: cafe.cwd };
        if (barista) {
            vars.BARISTA = barista.cwd;
        }
        return vars;
    }
}
exports.Action = Action;
