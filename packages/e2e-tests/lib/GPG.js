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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPG = void 0;
const node_child_process_1 = __importDefault(require("node:child_process"));
const node_fs_1 = __importDefault(require("node:fs"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
const core = __importStar(require("@actions/core"));
const utilities_1 = require("./utilities");
class GPG {
    constructor(inputs) {
        this.inputs = inputs;
        this.groupName = 'GPG';
    }
    isInstalled() {
        return (0, utilities_1.command)('gpg');
    }
    /**
     * @param source Path to encrypted GPG file
     * @param target Where to saved decrypted file to (defaults to source minus '.gpg' part)
     * @returns Absolute path to decrypted file or `false` on failure
     */
    decrypt(source, target) {
        if (!this.isInstalled()) {
            return false;
        }
        const password = this.getPassword();
        if (!password) {
            return false;
        }
        const input = this.getPath(source);
        if (!input) {
            return false;
        }
        const output = target ? (0, utilities_1.absPath)(target) : input.replace('.gpg', '');
        if (node_fs_1.default.existsSync(output)) {
            core.startGroup(this.groupName);
            core.error('Cannot decrypt GPG file in-place!');
            core.error(`Output path already exists: '${output}' !`);
            core.endGroup();
            return false;
        }
        const args = ['--batch', '--decrypt', '--passphrase-fd', '0', '--output', output, input];
        const options = { stdio: 'pipe', input: password, encoding: 'utf-8' };
        const command = node_child_process_1.default.spawnSync('gpg', args, options);
        console.log(command.stdout);
        if (command.status !== 0) {
            const message = `Failed to decrypt GPG file: '${input}' !`;
            (0, utilities_1.logSpawnSyncError)({ command, message, group: this.groupName });
            return false;
        }
        return output;
    }
    /**
     * @param source Path to file (NOT folders) which require encryption
     * @param target Where to save the encrypted file (defaults to 'source.gpg')
     * @return Absolute path to encrypted file or `false` on failure
     */
    encrypt(source, target) {
        if (!this.isInstalled()) {
            return false;
        }
        const password = this.getPassword();
        if (!password) {
            return false;
        }
        const cipher = this.getCipher();
        if (!cipher) {
            return false;
        }
        const input = this.getPath(source);
        if (!input) {
            return false;
        }
        const output = target ? (0, utilities_1.absPath)(target) : input + '.gpg';
        const args = [
            '--batch',
            '--symmetric',
            '--passphrase-fd',
            '0',
            '--cipher-algo',
            cipher,
            '--output',
            output,
            input,
        ];
        const options = { stdio: 'pipe', input: password, encoding: 'utf-8' };
        const command = node_child_process_1.default.spawnSync('gpg', args, options);
        console.log(command.stdout);
        if (command.status !== 0) {
            const message = 'GPG encryption has failed!';
            (0, utilities_1.logSpawnSyncError)({ command, message, group: this.groupName });
            return false;
        }
        return output;
    }
    getPath(input) {
        const p = (0, utilities_1.absPath)(input);
        if (!this.checkPath(p)) {
            core.startGroup(this.groupName);
            core.error('Given input path does not exist!');
            core.error('Raw input: ' + input);
            core.error('Absolute path: ' + p);
            core.endGroup();
            return false;
        }
        return p;
    }
    checkPath(path) {
        if (!node_fs_1.default.existsSync(path)) {
            core.startGroup(this.groupName);
            core.error(`Given path does not exist: '${path}' !`);
            core.endGroup();
            return false;
        }
        return true;
    }
    getPassword() {
        const password = this.inputs.gpgPassword();
        if (password.length === 0) {
            core.startGroup(this.groupName);
            core.error(`Missing value for input 'password' !`);
            core.endGroup();
            return false;
        }
        const strength = (0, zxcvbn_1.default)(password);
        if (strength.score < 3) {
            core.startGroup(this.groupName);
            strength.feedback.suggestions.forEach((s) => core.notice(s));
            core.warning(strength.feedback.warning);
            core.endGroup();
            return false;
        }
        return password;
    }
    getCipher() {
        const targetCipher = this.inputs.gpgCipher().toUpperCase();
        const supportedCiphers = this.getSupportedCiphers();
        if (!supportedCiphers) {
            return false;
        }
        if (!supportedCiphers.includes(targetCipher)) {
            core.startGroup(this.groupName);
            core.error(`Unsupported GPG cipher: ${targetCipher}`);
            core.notice(`Supported GPG ciphers: ${supportedCiphers.join(', ')}`);
            core.endGroup();
            return false;
        }
        return targetCipher;
    }
    getSupportedCiphers() {
        const command = node_child_process_1.default.spawnSync('gpg', ['--version'], { stdio: 'pipe', encoding: 'utf-8' });
        console.log(command.stdout);
        if (command.status !== 0) {
            const message = 'Failed to get available GPG ciphers!';
            (0, utilities_1.logSpawnSyncError)({ command, message, group: this.groupName });
            return false;
        }
        const stdoutArray = command.stdout.split('\n').filter((s) => s.length > 0);
        const ciphersIndex = stdoutArray.findIndex((s) => s.startsWith('Cipher: '));
        if (!stdoutArray[ciphersIndex] || !stdoutArray[ciphersIndex + 1]) {
            core.startGroup(this.groupName);
            core.error('Internal error! Unable to parse available GPG ciphers! (array index error)');
            core.endGroup();
            return false;
        }
        const ciphersString = stdoutArray[ciphersIndex] + ' ' + stdoutArray[ciphersIndex + 1].trim();
        const ciphersArray = ciphersString
            .replace('Cipher:', '')
            .trim()
            .split(',')
            .map((s) => s.trim());
        return ciphersArray;
    }
}
exports.GPG = GPG;
