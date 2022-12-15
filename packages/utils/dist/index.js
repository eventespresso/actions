require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 211:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.downloadUrl = void 0;
const fs_1 = __importDefault(__nccwpck_require__(147));
const https_1 = __importDefault(__nccwpck_require__(687));
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


/***/ }),

/***/ 433:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(211), exports);
__exportStar(__nccwpck_require__(321), exports);


/***/ }),

/***/ 321:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPath = void 0;
/**
 * Converts a string path to array path
 * that can be used in ramda path functions
 *
 * 'foo[1].bar' to ['foo', '1', 'bar']
 *
 * Source https://github.com/final-form/final-form
 */
const toPath = (key) => {
    if (key === null || key === undefined || !key.length) {
        return [];
    }
    if (typeof key !== 'string') {
        throw new Error('toPath() expects a string');
    }
    return key.split(/[.[\]]+/).filter(Boolean);
};
exports.toPath = toPath;


/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 687:
/***/ ((module) => {

module.exports = require("https");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(433);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map