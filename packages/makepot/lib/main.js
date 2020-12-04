"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const io = __importStar(require("@eventespresso-actions/io"));
const utils_1 = require("@eventespresso-actions/utils");
const utils_2 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const { exclude, headers, headersJsonFile, ignoreDomain, include, packageName, savePath, slug, textDomain, } = utils_2.getInput();
        try {
            //#region WP CLI setup
            core.startGroup('Setup WP-CLI');
            const wpcliPath = 'wp-cli.phar';
            // download WP CLI executable
            const error = yield utils_1.downloadUrl('https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar', wpcliPath);
            if (error) {
                throw new Error(error);
            }
            /**
             * Make the file executable
             * @see https://nodejs.org/api/fs.html#fs_fs_chmod_path_mode_callback
             */
            yield io.chmod(wpcliPath, 0o765);
            // move to path
            yield exec_1.exec('sudo mv', [wpcliPath, '/usr/local/bin/wp']);
            core.endGroup();
            //#endregion
            //#region Configuration
            const potPath = `${savePath}/${textDomain}.pot`;
            let potHeaders;
            if (headersJsonFile && io.existsSync(headersJsonFile)) {
                // JSON file may have spaces and new lines
                // we will parse it and stringify again to get rid of spaces and line breaks
                const headersObj = JSON.parse(io.readFileSync(headersJsonFile, { encoding: 'utf8' }));
                potHeaders = JSON.stringify(headersObj);
            }
            else {
                potHeaders = headers;
            }
            // command arguments
            const args = [
                `--slug=${slug}`,
                exclude && `--exclude=${exclude}`,
                potHeaders && `--headers=${potHeaders}`,
                ignoreDomain && '--ignore-domain',
                include && `--include=${include}`,
                packageName && `--package-name="${packageName}"`,
                textDomain && `--domain=${textDomain}`,
            ].filter(Boolean);
            //#endregion
            //#region POT file generation
            core.startGroup('Generating POT File');
            yield exec_1.exec('wp i18n make-pot .', [potPath, ...args, `--allow-root`]);
            // temporary - output POT file contents
            core.info(io.readFileSync(potPath, { encoding: 'utf8' }));
            core.endGroup();
            //#endregion
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
exports.default = run;
