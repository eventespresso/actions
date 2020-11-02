import * as fs from 'fs';
export * from '@actions/io';

export const { chmod, copyFile, lstat, mkdir, readdir, readFile, rename, rmdir, stat, symlink, unlink } = fs.promises;

export const { readFileSync, readdirSync, existsSync } = fs;
