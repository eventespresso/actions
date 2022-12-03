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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@eventespresso-actions/io"));
const utils_1 = require("./utils");
const ramda_1 = require("ramda");
function run() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const { infoJsonFile, mainFile, readmeFile, releaseType: releaseTypeInput, type, value } = (0, utils_1.getInput)();
        let updateInfoJson = false;
        try {
            // read main file contents
            let mainFileContents = io.readFileSync(mainFile, { encoding: 'utf8' });
            // read info.json file contents
            const infoJson = JSON.parse(io.readFileSync(infoJsonFile, { encoding: 'utf8' }));
            // get the current version using regex
            const currentVersion = (_b = (_a = mainFileContents.match(utils_1.MAIN_FILE_VERSION_REGEX)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.version;
            if (!currentVersion) {
                throw new Error('Could not parse version string from main file.');
            }
            const versionPartsMatch = currentVersion.match(utils_1.EE_VERSION_REGEX);
            if (!(versionPartsMatch === null || versionPartsMatch === void 0 ? void 0 : versionPartsMatch.groups)) {
                throw new Error('Invalid version! Version does not match the pattern');
            }
            // remove empty matches from groups to avoid them overriding defaults
            const nonEmptyVersionParts = (0, ramda_1.filter)(Boolean, versionPartsMatch === null || versionPartsMatch === void 0 ? void 0 : versionPartsMatch.groups);
            // build version parts by setting defaults
            const versionParts = Object.assign(Object.assign({}, utils_1.DEFAULT_VERSION_PARTS), nonEmptyVersionParts);
            // prefer releaseType from inputs or
            // extract `releaseType` from the parts as it's the only non-numeric part
            let releaseType = releaseTypeInput || versionParts.releaseType;
            // make sure the numeric parts of the version are numbers
            let { major, minor, patch, build } = versionParts;
            const valueBump = parseInt(value, 10);
            switch (type) {
                case 'major':
                    // either the value passed explicitly to reset build number or an incremented value
                    major = valueBump || ++major;
                    // both minor, patch and build numbers reset to zero
                    minor = 0;
                    patch = 0;
                    build = 0;
                    updateInfoJson = true;
                    break;
                case 'minor':
                    minor = valueBump || ++minor;
                    // patch and build reset to zero
                    patch = 0;
                    build = 0;
                    updateInfoJson = true;
                    break;
                case 'patch':
                    patch = valueBump || ++patch;
                    build = 0;
                    updateInfoJson = true;
                    break;
                case 'build':
                    build = valueBump || ++build;
                    // to use build number there must be a release type.
                    // if none is present or supplied, use `rc` by default
                    releaseType = releaseType || 'rc';
                    break;
                case 'release_type':
                    releaseType = value || releaseType || 'rc';
                    break;
            }
            let newVersion = `${major}.${minor}.${patch}`;
            // add releaseType if not empty
            if (releaseType) {
                newVersion += `.${releaseType}`;
            }
            // add valid build number for alpha, beta, or release candidate versions
            if (build > 0 && ['alpha', 'beta', 'rc'].includes(releaseType)) {
                newVersion += `.${build.toString().padStart(3, '0')}`;
            }
            // replace versions in main file with newVersion.
            mainFileContents = mainFileContents.replace(`${currentVersion}/g`, newVersion);
            // update info.json, so decaf release get built off of this tag.
            if (updateInfoJson && infoJson) {
                infoJson.wpOrgRelease = newVersion;
                const infoJsonContents = JSON.stringify(infoJson, null, 2);
                // now save back to info.json
                io.writeFileSync(infoJsonFile, infoJsonContents, { encoding: 'utf8' });
            }
            // if version type is decaf then let's update extra values in main file and the readme.txt as well.
            if (releaseType === 'decaf') {
                // but we're also changing the plugin name and uri
                const pluginUri = (_e = (_d = (_c = mainFileContents.match(utils_1.MAIN_FILE_PLUGIN_URI_REGEX)) === null || _c === void 0 ? void 0 : _c.groups) === null || _d === void 0 ? void 0 : _d.plugin_uri) === null || _e === void 0 ? void 0 : _e.trim();
                const pluginName = (_h = (_g = (_f = mainFileContents.match(utils_1.MAIN_FILE_PLUGIN_NAME_REGEX)) === null || _f === void 0 ? void 0 : _f.groups) === null || _g === void 0 ? void 0 : _g.plugin_name) === null || _h === void 0 ? void 0 : _h.trim();
                if (pluginUri) {
                    mainFileContents = mainFileContents.replace(pluginUri, infoJson.wpOrgPluginUrl);
                }
                if (pluginName) {
                    mainFileContents = mainFileContents.replace(pluginName, infoJson.wpOrgPluginName);
                }
                // get readme.txt file contents.
                let readmeContents = io.readFileSync(readmeFile, { encoding: 'utf8' });
                // replace stable tag in readme.txt
                readmeContents = readmeContents.replace(utils_1.README_FILE_STABLE_TAG_REGEX, 
                // `match` is like "Stable tag: 4.10.4.decaf"
                // `p1` is the first and only capturing group like "4.10.4.decaf"
                (match, p1) => match.replace(p1, newVersion));
                // now save back to readme.txt
                io.writeFileSync(readmeFile, readmeContents, { encoding: 'utf8' });
            }
            // now finally save the main file contents
            io.writeFileSync(mainFile, mainFileContents, { encoding: 'utf8' });
            // set the output
            core.setOutput('new-version', newVersion);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
exports.default = run;
