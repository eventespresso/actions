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
const io = __importStar(require("@eventespresso-actions/io"));
const utils_1 = require("./utils");
const ramda_1 = require("ramda");
const utils_2 = require("@eventespresso-actions/utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const { filePath, outputAsJson, propPath } = (0, utils_1.getInput)();
        try {
            // read the JSOn file
            const obj = JSON.parse(io.readFileSync(filePath, { encoding: 'utf8' }));
            // get the value from the given path
            let propValue = (0, ramda_1.path)((0, utils_2.toPath)(propPath), obj);
            if (typeof propValue === 'undefined') {
                throw new Error(`Path ${propPath} does not exist in ${filePath}`);
            }
            if (outputAsJson) {
                propValue = JSON.stringify(propValue);
            }
            core.setOutput('value', propValue);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
exports.default = run;
