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
exports.updateInfoJsonFile = void 0;
const io_1 = require("@eventespresso-actions/io");
const utils_1 = require("./utils");
function updateInfoJsonFile(newVersion, updateInfoJson) {
    return __awaiter(this, void 0, void 0, function* () {
        const { infoJsonFile } = (0, utils_1.getInput)();
        // read info.json file contents
        const infoJsonContent = yield (0, io_1.readFile)(infoJsonFile, { encoding: 'utf8' });
        const infoJson = JSON.parse(infoJsonContent);
        // update info.json, so decaf release get built off of this tag.
        if (updateInfoJson && infoJson) {
            infoJson.wpOrgRelease = newVersion;
            const infoJsonContents = JSON.stringify(infoJson, null, 2);
            // now save back to info.json
            yield (0, io_1.writeFile)(infoJsonFile, infoJsonContents, { encoding: 'utf8' });
        }
        return infoJson;
    });
}
exports.updateInfoJsonFile = updateInfoJsonFile;
