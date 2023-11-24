"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tar = void 0;
const utilities_1 = require("./utilities");
const node_child_process_1 = __importDefault(require("node:child_process"));
const node_fs_1 = __importDefault(require("node:fs"));
class Tar {
    constructor() {
        this.group = 'tar';
    }
    isInstalled() {
        return (0, utilities_1.command)('tar', this.group);
    }
    /**
     * @param files Files to be tarballed
     * @param tarball Path to the (newly) created tarball
     * @returns Absolute path to tarball file or `false` on failure
     */
    create(files, tarball) {
        if (!this.isInstalled()) {
            return false;
        }
        const inputs = typeof files === 'string' ? [files] : files;
        for (const i of inputs) {
            if (!node_fs_1.default.existsSync(i)) {
                (0, utilities_1.log)(`Given tar input '${i}' does not exist!`, { group: this.group });
                return false;
            }
        }
        const output = this.getTarballPath(files, tarball);
        if (!output) {
            return false;
        }
        if (node_fs_1.default.existsSync(output)) {
            (0, utilities_1.log)(`Output path for tarball already exists: '${output}' !`, { group: this.group });
            return false;
        }
        const command = node_child_process_1.default.spawnSync('tar', ['--create', '--verbose', '--file', output, ...inputs], {
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        console.log(command.stdout);
        if (command.status !== 0) {
            (0, utilities_1.logSpawnSyncError)({ command, group: this.group, message: 'Could not create tarball!' });
            return false;
        }
        return output;
    }
    getTarballPath(files, archive) {
        if (archive && archive.length === 0) {
            (0, utilities_1.log)('Given empty string to tar output path!', { group: this.group });
            return false;
        }
        if (typeof files === 'string') {
            if (archive) {
                return (0, utilities_1.absPath)(archive);
            }
            if (!archive) {
                return files.replace(/\/$/, '') + '.tar';
            }
        }
        if (Array.isArray(files)) {
            if (archive) {
                return (0, utilities_1.absPath)(archive);
            }
            (0, utilities_1.log)('When supplying an array of files to tar, need to explicitly set archive file name!', {
                group: this.group,
            });
            return false;
        }
        (0, utilities_1.log)(`Tar received unsupported data type for argument 'files': ${typeof files} \nOnly supported: string, array!`, { group: this.group });
        return false;
    }
    /**
     * @param tarball Path to tarball
     * @param directory Specify output directory (optional, see --directory)
     * @returns Absolute path to extraction path or `false` on failure
     */
    extract(tarball, directory) {
        if (!this.isInstalled()) {
            return false;
        }
        const input = (0, utilities_1.absPath)(tarball);
        const output = directory !== null && directory !== void 0 ? directory : (0, utilities_1.cwd)();
        if (!node_fs_1.default.existsSync(input)) {
            (0, utilities_1.log)(`Did not find given tarball archive '${input}'!`, { group: this.group });
            return false;
        }
        if (directory) {
            const parentAbs = (0, utilities_1.absPath)(directory);
            if (!node_fs_1.default.existsSync(parentAbs)) {
                node_fs_1.default.mkdirSync(parentAbs, { recursive: true });
            }
        }
        const command = node_child_process_1.default.spawnSync('tar', ['--extract', '--verbose', '--file', input, '--directory', output], { stdio: 'pipe', encoding: 'utf-8' });
        console.log(command.stdout);
        if (command.status !== 0) {
            (0, utilities_1.logSpawnSyncError)({ command, message: `Failed to extract tarball '${input}'!`, group: this.group });
            return false;
        }
        return output;
    }
}
exports.Tar = Tar;
