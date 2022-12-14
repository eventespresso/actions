"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersionParts = void 0;
const ramda_1 = require("ramda");
const utils_1 = require("./utils");
function getVersionParts(currentVersion) {
    const versionPartsMatch = currentVersion.match(utils_1.EE_VERSION_REGEX);
    if (!(versionPartsMatch === null || versionPartsMatch === void 0 ? void 0 : versionPartsMatch.groups)) {
        throw new Error('Invalid version! Version does not match the pattern');
    }
    // remove empty matches from groups to avoid them overriding defaults
    const nonEmptyVersionParts = (0, ramda_1.filter)(Boolean, versionPartsMatch === null || versionPartsMatch === void 0 ? void 0 : versionPartsMatch.groups);
    // build version parts by setting defaults
    const versionParts = Object.assign(Object.assign({}, utils_1.DEFAULT_VERSION_PARTS), nonEmptyVersionParts);
    console.log({ versionParts });
    return versionParts;
}
exports.getVersionParts = getVersionParts;
