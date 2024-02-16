import { error, annotation } from './utilities';
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as Path from 'node:path';

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
			error(`Cannot perform 'git clone' as the destination path already exists!`, 'Path: ' + path);
			annotation('Cannot clone repository! (click for more details)');
			throw new Error();
		}
	}

	private sanitizeName(name: string): string {
		return name
			.toLowerCase() // all lower case, easy to work with cli
			.replaceAll(' ', '-') // no spaces
			.replaceAll(/[^a-z0-9-]/g, ''); // only letters, digits, and dash (hyphen)
	}
}

export { Repository };
