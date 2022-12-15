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
exports.handleDecafRelease = void 0;
const updateInfoJsonFile_1 = require("./updateInfoJsonFile");
const utils_1 = require("./utils");
function handleDecafRelease(mainFileContents, newVersion, infoJsonFile, updateInfoJson) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        // read info.json file contents and possibly update
        const infoJson = yield (0, updateInfoJsonFile_1.updateInfoJsonFile)(newVersion, infoJsonFile, updateInfoJson);
        // but we're also changing the plugin name and uri
        const pluginUri = (_c = (_b = (_a = mainFileContents.match(utils_1.MAIN_FILE_PLUGIN_URI_REGEX)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.plugin_uri) === null || _c === void 0 ? void 0 : _c.trim();
        const pluginName = (_f = (_e = (_d = mainFileContents.match(utils_1.MAIN_FILE_PLUGIN_NAME_REGEX)) === null || _d === void 0 ? void 0 : _d.groups) === null || _e === void 0 ? void 0 : _e.plugin_name) === null || _f === void 0 ? void 0 : _f.trim();
        if (pluginUri) {
            mainFileContents = mainFileContents.replace(pluginUri, infoJson.wpOrgPluginUrl);
        }
        if (pluginName) {
            mainFileContents = mainFileContents.replace(pluginName, infoJson.wpOrgPluginName);
        }
        return mainFileContents;
    });
}
exports.handleDecafRelease = handleDecafRelease;
