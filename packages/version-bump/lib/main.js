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
const io_1 = require("@eventespresso-actions/io");
const getVersionInfo_1 = require("./getVersionInfo");
const handleDecafRelease_1 = require("./handleDecafRelease");
const updateReadmeFile_1 = require("./updateReadmeFile");
const utils_1 = require("./utils");
function run(mainFile, releaseTypeInput, type, value) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // read main file contents
            let mainFileContents = yield (0, io_1.readFile)(mainFile, { encoding: 'utf8' }).toString().trim();
            // get the current version using regex
            const currentVersion = (_b = (_a = mainFileContents.match(utils_1.MAIN_FILE_VERSION_REGEX)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.version;
            if (!currentVersion) {
                throw new Error('Could not parse version string from main file.');
            }
            const { releaseType, newVersion, updateInfoJson } = yield (0, getVersionInfo_1.getVersionInfo)(currentVersion, releaseTypeInput, type, value);
            // replace versions in main file with newVersion.
            mainFileContents = mainFileContents.replace(new RegExp(`${newVersion}`, 'gi'), newVersion);
            console.log({ mainFileContents });
            // if version type is decaf then let's update extra values in main file and the readme.txt as well.
            if (releaseType === 'decaf') {
                mainFileContents = yield (0, handleDecafRelease_1.handleDecafRelease)(mainFileContents, newVersion, updateInfoJson);
                yield (0, updateReadmeFile_1.updateReadmeFile)(newVersion);
            }
            // now finally save the main file contents with newline added at end
            yield (0, io_1.writeFile)(mainFile, `${mainFileContents}\n`, { encoding: 'utf8' });
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
