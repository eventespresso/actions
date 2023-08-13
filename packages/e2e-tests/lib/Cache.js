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
const core = __importStar(require("@actions/core"));
const cache = __importStar(require("@actions/cache"));
class Cache {
    constructor() {
        if (!cache.isFeatureAvailable()) {
            core.error('Cache service is not available');
        }
    }
    /**
     * @param key
     * @param paths
     * @returns cache id or false is service failed
     */
    save(key, paths) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield cache.saveCache(paths, key);
            }
            catch (error) {
                core.error(`Failed to save cache with key ${key}`);
                core.error(error);
                return false;
            }
        });
    }
    restore(key, paths, optKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const restore = yield cache.restoreCache(paths, key, optKeys);
            if (typeof restore === 'undefined') {
                core.notice(`Did not find cache with key ${key}`);
                return false;
            }
            return true;
        });
    }
}
exports.Cache = Cache;
