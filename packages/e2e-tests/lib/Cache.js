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
exports.Cache = void 0;
const utilities_1 = require("./utilities");
const cache = __importStar(require("@actions/cache"));
class Cache {
    constructor(repo) {
        this.repo = repo;
        if (!cache.isFeatureAvailable()) {
            (0, utilities_1.error)('Cache service is not available');
        }
    }
    /**
     * @returns cache id or false if saving failed
     */
    save(key, paths) {
        return __awaiter(this, void 0, void 0, function* () {
            const k = this.makeKey(key);
            try {
                // .slice() is a required workaround until GitHub fixes cache
                // https://github.com/actions/toolkit/issues/1377
                return yield cache.saveCache(paths.slice(), k);
            }
            catch (err) {
                (0, utilities_1.error)('Failed to save cache with key:' + k, 'Error: ' + `${err}`);
                return false;
            }
        });
    }
    restore(key, paths) {
        return __awaiter(this, void 0, void 0, function* () {
            const k = this.makeKey(key);
            let restore = undefined;
            try {
                // .slice() is a required workaround until GitHub fixes cache
                // https://github.com/actions/toolkit/issues/1377
                restore = yield cache.restoreCache(paths.slice(), k);
            }
            catch (err) {
                (0, utilities_1.error)(`${err}`);
            }
            if (typeof restore === 'undefined') {
                (0, utilities_1.error)(`Failed to retrieve cache with key: \n${k}`);
                return false;
            }
            return true;
        });
    }
    makeKey(key) {
        // generate contextual key since we are dealing with multiple repositories
        const k = `repo-${this.repo.name}-${this.repo.branch}-${key}`;
        const limit = 512; // https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#input-parameters-for-the-cache-action
        if (k.length > limit) {
            (0, utilities_1.annotation)(`Cache key exceeded length of ${limit} chars: ` + k);
            throw new Error();
        }
        return k;
    }
}
exports.Cache = Cache;
