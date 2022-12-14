"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("./main"));
const utils_1 = require("./utils");
const { mainFile, releaseType: releaseTypeInput, type, value } = (0, utils_1.getInput)();
(0, main_1.default)(mainFile, releaseTypeInput, type, value);
