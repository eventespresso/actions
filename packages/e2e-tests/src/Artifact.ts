import * as path from 'node:path';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as artifact from '@actions/artifact';
import type { ArtifactClient, UploadOptions } from '@actions/artifact';

class Artifact {
	private readonly client: ArtifactClient;

	constructor() {
		this.client = artifact.create();
	}

	/**
	 * Save given files/folders as an GitHub artifact
	 * @param input A path or an array of paths to files or directories
	 * @parma workDir Working directory (absolute path) from where files/folders are upload (parent directory for the given input)
	 * @param name Name under which artifact will be saved
	 * @param days For how many days artifact will be kept
	 * @returns True if artifact was saved and false otherwise
	 */
	public async save(input: string | string[], workDir: string, name: string, days: number): Promise<boolean> {
		const files = await this.getFiles(input, workDir);

		// no need to abort CI runner if artifact upload fails
		// this method returns true/false which allows the invoking
		// code to decide if process should be stopped or not
		const options: UploadOptions = { continueOnError: true, retentionDays: days };

		if (files.length === 0) {
			core.notice(
				`Given artifact input '${this.inputToStr(input)}' is empty following working directory '${workDir}'`
			);
			return false;
		}

		let upload = undefined;

		try {
			upload = await this.client.uploadArtifact(name, files, workDir, options);
		} catch (error) {
			core.error(`Failed to save artifact '${name}', see below for details`);
			core.error(`${error}`);
			return false;
		}

		if (upload.failedItems.length > 0) {
			const failed = upload.failedItems.join('\n');
			core.error(`Failied to upload some files for artifact '${name}':\n${failed}`);
			return false;
		}

		return true;
	}

	/**
	 * Convert given input string or array of inputs to string
	 */
	private inputToStr(input: string | string[]): string {
		if (typeof input === 'string') {
			return input;
		}
		return input.join(', ');
	}

	/**
	 * Convert given path(s) of whatever (files/folders) to an array of individual files with absolute path
	 */
	private async getFiles(input: string | string[], workDir: string): Promise<string[]> {
		const arrInput = this.inputToArr(input);
		const absInput = arrInput.map((i) => this.absPath(i, workDir));
		const promises = absInput.map((i) => this.inputToFiles(i));
		const files = await Promise.all(promises);
		return files.flat();
	}

	/**
	 * Ensure that given input is always returned as an array
	 */
	private inputToArr(input: string | string[]): string[] {
		if (typeof input === 'string') {
			return [input];
		}
		return input;
	}

	/**
	 * Convert given input (assuming with pattern) to array of individuals files
	 */
	private async inputToFiles(input: string): Promise<string[]> {
		if (input.slice(-1) !== '*') {
			// if no pattern is present, there is nothing to be globbed
			return [input];
		}
		return (await glob.create(input)).glob();
	}

	/**
	 * Ensure given path is always absolute
	 */
	private absPath(input: string, workDir: string): string {
		if (input[0] === '/') {
			// input is already absolute, nothing to be done
			return input;
		}
		return path.resolve(workDir, input);
	}
}

export { Artifact };
