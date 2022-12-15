"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadUrl = void 0;
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
/**
 * Download the given URL to the given destination.
 */
const downloadUrl = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs_1.default.createWriteStream(dest, { flags: 'wx' });
        const request = https_1.default.get(url, (response) => {
            // make sure we have a valid status code
            if (response.statusCode === 200) {
                response.pipe(file);
            }
            else {
                file.close();
                fs_1.default.unlink(dest, () => null);
                reject(`Download failed! Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        });
        request.on('error', (err) => {
            file.close();
            fs_1.default.unlink(dest, () => null);
            reject(err.message);
        });
        file.on('finish', () => {
            resolve('Success');
        });
        file.on('error', (err) => {
            file.close();
            if (err.name === 'EEXIST') {
                reject('File already exists');
            }
            else {
                fs_1.default.unlink(dest, () => null);
                reject(err.message);
            }
        });
    });
};
exports.downloadUrl = downloadUrl;
