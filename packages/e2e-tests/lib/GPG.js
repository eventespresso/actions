"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPG = void 0;
const utilities_1 = require("./utilities");
const zxcvbn_1 = __importDefault(require("zxcvbn"));
const node_child_process_1 = __importDefault(require("node:child_process"));
const node_fs_1 = __importDefault(require("node:fs"));
// LATER: refactor to use SpawnSync.ts for improved error handling
class GPG {
    constructor(inputs) {
        this.inputs = inputs;
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
            (0, utilities_1.error)('Cannot decrypt GPG file in-place!', 'Output path already exists!', 'File path: ' + output);
            return false;
        }
        const args = ['--batch', '--decrypt', '--passphrase-fd', '0', '--output', output, input];
        const options = { stdio: 'pipe', input: password, encoding: 'utf-8' };
        const command = node_child_process_1.default.spawnSync('gpg', args, options);
        (0, utilities_1.log)(command.stdout);
        if (command.status !== 0) {
            (0, utilities_1.errorForSpawnSync)(command, 'Failed to decrypt GPG file!', 'File path: ' + input);
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
        if (command.status === 0) {
            (0, utilities_1.log)(command.stdout);
        }
        if (command.status !== 0) {
            (0, utilities_1.errorForSpawnSync)(command, 'GPG encryption has failed!', 'File path: ' + source);
            return false;
        }
        return output;
    }
    getPath(input) {
        const p = (0, utilities_1.absPath)(input);
        if (!this.checkPath(p)) {
            (0, utilities_1.error)('Given input path does not exist!', 'Absolute path: ' + p);
            return false;
        }
        return p;
    }
    checkPath(path) {
        if (!node_fs_1.default.existsSync(path)) {
            (0, utilities_1.error)('Given path does not exist!', 'File path: ' + path);
            return false;
        }
        return true;
    }
    getPassword() {
        const password = this.inputs.gpgPassword();
        if (password.length === 0) {
            (0, utilities_1.error)(`Missing value for input 'password' !`);
            return false;
        }
        const strength = (0, zxcvbn_1.default)(password);
        if (strength.score < 3) {
            (0, utilities_1.error)(strength.feedback.warning, ...strength.feedback.suggestions);
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
            (0, utilities_1.error)(`Unsupported GPG cipher: ${targetCipher}`, `Supported GPG ciphers: ${supportedCiphers.join(', ')}`);
            return false;
        }
        return targetCipher;
    }
    getSupportedCiphers() {
        const command = node_child_process_1.default.spawnSync('gpg', ['--version'], { stdio: 'pipe', encoding: 'utf-8' });
        if (command.status === 0) {
            (0, utilities_1.log)(command.stdout);
        }
        if (command.status !== 0) {
            (0, utilities_1.errorForSpawnSync)(command, 'Failed to get available GPG ciphers!');
            return false;
        }
        const stdoutArray = command.stdout.split('\n').filter((s) => s.length > 0);
        const ciphersIndex = stdoutArray.findIndex((s) => s.startsWith('Cipher: '));
        if (!stdoutArray[ciphersIndex] || !stdoutArray[ciphersIndex + 1]) {
            (0, utilities_1.error)('Internal error! Unable to parse available GPG ciphers! (array index error)');
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
