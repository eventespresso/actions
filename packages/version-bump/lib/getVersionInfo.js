"use strict";
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
exports.getVersionInfo = void 0;
const getVersionParts_1 = require("./getVersionParts");
function getVersionInfo(currentVersion, releaseTypeInput, bumpType, customValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const versionParts = (0, getVersionParts_1.getVersionParts)(currentVersion);
        // prefer releaseType from inputs or
        // extract `releaseType` from the parts as it's the only non-numeric part
        let releaseType = releaseTypeInput || versionParts.releaseType;
        // make sure the numeric parts of the version are numbers
        let { major, minor, patch, build } = versionParts;
        let updateInfoJson = false;
        const valueBump = parseInt(customValue, 10);
        switch (bumpType) {
            case 'major':
                // either the value passed explicitly to reset build number or an incremented value
                major = valueBump || ++major;
                // both minor, patch and build numbers reset to zero
                minor = 0;
                patch = 0;
                build = 1;
                updateInfoJson = true;
                break;
            case 'minor':
                minor = valueBump || ++minor;
                // patch and build reset to zero
                patch = 0;
                build = 1;
                updateInfoJson = true;
                break;
            case 'patch':
                patch = valueBump || ++patch;
                build = 1;
                updateInfoJson = true;
                break;
            case 'build':
                build = valueBump || ++build;
                // to use build number there must be a release type.
                // if none is present or supplied, use `rc` by default
                releaseType = releaseType || 'rc';
                break;
            case 'custom':
                releaseType = customValue || releaseType || 'rc';
                if (releaseType === 'rc') {
                    ++build;
                }
                break;
        }
        let newVersion = `${major}.${minor}.${patch}`;
        // add releaseType if not empty
        if (releaseType) {
            newVersion += `.${releaseType}`;
        }
        // add valid build number for release candidate versions
        if (releaseType === 'rc') {
            newVersion += `.${build.toString().padStart(3, '0')}`;
        }
        console.log({ newVersion });
        return { releaseType, newVersion, updateInfoJson };
    });
}
exports.getVersionInfo = getVersionInfo;
