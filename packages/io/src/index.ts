import * as fs from 'fs';
export * from '@actions/io';

export const { chmod, copyFile, lstat, mkdir, readdir, readFile, rename, unlink, writeFile } = fs.promises;

export const { readFileSync, readdirSync, existsSync, writeFileSync } = fs;
