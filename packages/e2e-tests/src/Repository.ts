import * as os from 'os';
import * as fs from 'fs';
import * as Path from 'path';
import * as core from '@actions/core';

type Parameters = {
	name: string;
	remote: string;
	branch: string;
};

class Repository {
	public readonly name: string;
	public readonly branch: string;
	public readonly cwd: string;
	public readonly remote: string;

	constructor(params: Parameters) {
		const name = this.sanitizeName(params.name);
		const cwd = this.makeCwd(name);

		this.name = name;
		this.branch = params.branch;
		this.cwd = cwd;
		this.remote = params.remote;
	}

	private makeCwd(name: string): string {
		const cwd = Path.resolve(os.tmpdir(), name);
		this.checkPathAvailable(cwd);
		return cwd;
	}

	private checkPathAvailable(path: string): void {
		if (fs.existsSync(path)) {
			core.setFailed(`Given path already exists: \n${path}`);
		}
	}

	private sanitizeName(name: string): string {
		return name
			.toLowerCase() // all lower case, easy to work with cli
			.replaceAll(' ', '-') // no spaces
			.replaceAll(/[^a-z0-9]/g, ''); // only letters and digits
	}
}

export { Repository };
