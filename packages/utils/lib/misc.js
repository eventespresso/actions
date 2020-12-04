"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPath = void 0;
/**
 * Converts a string path to array path
 * that can be used in ramda path functions
 *
 * 'foo[1].bar' to ['foo', '1', 'bar']
 *
 * Source https://github.com/final-form/final-form
 */
exports.toPath = (key) => {
    if (key === null || key === undefined || !key.length) {
        return [];
    }
    if (typeof key !== 'string') {
        throw new Error('toPath() expects a string');
    }
    return key.split(/[.[\]]+/).filter(Boolean);
};
