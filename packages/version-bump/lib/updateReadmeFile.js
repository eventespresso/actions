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
exports.updateReadmeFile = void 0;
const io_1 = require("@eventespresso-actions/io");
const utils_1 = require("./utils");
function updateReadmeFile(newVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const { readmeFile } = (0, utils_1.getInput)();
        // get readme.txt file contents.
        let readmeContents = yield (0, io_1.readFile)(readmeFile, { encoding: 'utf8' });
        // replace stable tag in readme.txt
        readmeContents = readmeContents.replace(utils_1.README_FILE_STABLE_TAG_REGEX, 
        // `match` is like "Stable tag: 4.10.4.decaf"
        // `p1` is the first and only capturing group like "4.10.4.decaf"
        (match, p1) => match.replace(p1, newVersion));
        // now save back to readme.txt
        yield (0, io_1.writeFile)(readmeFile, readmeContents, { encoding: 'utf8' });
    });
}
exports.updateReadmeFile = updateReadmeFile;
