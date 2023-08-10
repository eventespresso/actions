import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

class Repository {
	private readonly name: string;
	private readonly cwd: string;

	constructor(params: Parameters) {
		this.name = this.sanitizeName(params.name);
		this.cwd = params.remote ? this.clone(params.remote) : params.local ? this.checkPath(params.local) : 'unknown';
		if (this.cwd === 'unknown') {
			throw new Error('Unexpected runtime condition!');
		}
	}

	public exec(command: string): void {
		child_process.spawnSync(command, {
			shell: true,
			stdio: 'inherit',
			cwd: this.cwd,
		});
	}

	private checkPath(path: string): string {
		if (!fs.existsSync(path)) {
			throw new Error(`Path does not exist: \n${path}`);
		}
		return path;
	}

	private sanitizeName(name: string): string {
		return name
			.toLowerCase() // all lower case, easy to work with cli
			.replaceAll(' ', '-') // no spaces
			.replaceAll(/[^a-z0-9]/, ''); // only letters and digits
	}

	/**
	 * @return local path to repository
	 */
	private clone(remote: string): string {
		const path = this.getPath(this.name);
		const cmd = `git clone ${remote} ${path}`;
		child_process.execSync(cmd);
		return path;
	}

	private getPath(subpath?: string): string {
		return path.resolve(os.tmpdir(), subpath ?? '');
	}
}

type Parameters = {
	name: string;
	remote?: string; // if repo is already cloned, we don't need remote
	local?: string; // if repo is not yet cloned, there cannot be local
};

export { Repository };
