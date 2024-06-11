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
exports.Docker = void 0;
const utilities_1 = require("./utilities");
const cache = __importStar(require("@actions/cache"));
const os = __importStar(require("node:os"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
/**
 * This class add ability to save and restore docker images
 * Currently, it is not in use due to sub-optimal performance results
 * https://github.com/eventespresso/barista/issues/1222#issuecomment-1684280811
 */
class Docker {
    constructor(spawnSync) {
        this.spawnSync = spawnSync;
    }
    saveImages() {
        return __awaiter(this, void 0, void 0, function* () {
            const [fileName /* workDir */, , filePath] = this.getParams();
            (0, utilities_1.log)('Saving docker images to cache: ' + fileName);
            const imagesList = this.listImages();
            this.spawnSync.call('docker', ['save', '--output', filePath, ...imagesList]);
            if (!fs.existsSync(filePath)) {
                (0, utilities_1.error)('Failed to save docker images at', 'File path: ' + filePath);
                return false;
            }
            try {
                yield cache.saveCache([filePath], fileName);
            }
            catch (err) {
                (0, utilities_1.error)('Failed to save docker images into cache', `${err}`);
                return false;
            }
            return true;
        });
    }
    loadImages() {
        return __awaiter(this, void 0, void 0, function* () {
            const [fileName /* workDir */, , filePath] = this.getParams();
            let restore = undefined;
            try {
                restore = yield cache.restoreCache([filePath], fileName, [], {});
            }
            catch (err) {
                (0, utilities_1.error)('Failed to restore docker images from cache', `${err}`);
                return false;
            }
            if (!restore) {
                (0, utilities_1.error)('No cache found for docker images');
                return false;
            }
            this.spawnSync.call('docker', ['load', '--input', filePath]);
            return true;
        });
    }
    listImages() {
        return this.spawnSync
            .call('docker', ['images', '--quiet'], {
            stdout: 'pipe',
        })
            .stdout.trim()
            .split('\n');
    }
    /**
     * @return {[string,string,string]} [filename, workdir, full path]
     */
    getParams() {
        const fileName = 'docker-images.tar';
        const workDir = os.tmpdir();
        const filePath = path.resolve(workDir, fileName);
        return [fileName, workDir, filePath];
    }
}
exports.Docker = Docker;
