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
exports.Browsers = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
class Browsers {
    constructor(spawnSync) {
        this.spawnSync = spawnSync;
    }
    install(ctx) {
        this.installBrowsers(ctx);
        this.initChromium(ctx);
        this.initFirefox(ctx);
        this.importCARoot();
    }
    installBrowsers(ctx) {
        // npx will attempt to use local packages first
        // hence we need to use repo context here instead of global
        ctx.call('npx', ['playwright', 'install', '--with-deps']);
    }
    importCARoot() {
        // import mkcert root CA to browsers
        // do *NOT* use sudo here
        // https://github.com/microsoft/playwright/issues/4785#issuecomment-1133864469
        this.spawnSync.call('mkcert', ['-install']);
    }
    initChromium(ctx) {
        // initialize browsers security stores (SSL stores)
        // https://github.com/microsoft/playwright/issues/4785#issuecomment-1385011931
        ctx.call('npx', [
            'playwright',
            'screenshot',
            '--browser',
            'chromium',
            'https://www.google.com',
            path.resolve(os.tmpdir(), 'init-browser-stores.png'),
        ]);
    }
    initFirefox(ctx) {
        // blocked by https://github.com/FiloSottile/mkcert/pull/520
        // mkcert does not support firefox-nightly cert store which is what Playwright uses for Firefox browser (Nightly as opposed to stable)
        // workaround would be problematic because ddev detects presence
        // of mkcert and automatically sets up WP with https instead of http
        // https://stackoverflow.com/a/65111281/4343719
        // it seems easier for now to block FireFox testing and wait for PR#520
        // ctx.call('npx', [
        // 	'playwright',
        // 	'screenshot',
        // 	'--browser',
        // 	'firefox',
        // 	'https://www.google.com',
        // 	path.resolve(os.tmpdir(), 'init-browser-stores.png'),
        // ]);
    }
}
exports.Browsers = Browsers;
