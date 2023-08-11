import * as os from 'os';
import * as fs from 'fs';
import * as Path from 'path';
import * as ChildProcess from 'child_process';

class Repository {
	private readonly name: string;
	private readonly cwd: string;

	constructor(params: Parameters) {
		this.name = this.sanitizeName(params.name);
		this.cwd = this.determineCwd(params.localOrRemote);
	}

	public exec(command: string): void {
		const outcome = ChildProcess.spawnSync(command, {
			shell: true,
			stdio: ['inherit', 'inherit', 'pipe'],
			cwd: this.cwd,
		});
		if (outcome.status !== 0) {
			const strArr = [`Failed to execute command: ${command}`, '\n', outcome.stderr.toString()] as const;
			const msg = strArr.join('\n');
			throw new Error(msg);
		}
	}

	public getCwd(): string {
		// conceal cwd behind method to enforce validation
		return this.cwd;
	}

	private determineCwd(localOrRemote: string): string {
		const type = this.getType(localOrRemote);
		if (type === 'local') return this.checkPath(localOrRemote);
		if (type === 'remote') return this.clone(localOrRemote);
		throw new Error(`Unknown git repository format: \n${localOrRemote}`);
	}

	private checkPath(path: string): string {
		if (!fs.existsSync(path)) {
			throw new Error(`Path does not exist: \n${path}`);
		}
		return path;
	}

	private getType(localOrRemote: string): 'local' | 'remote' {
		if (localOrRemote.startsWith('https://')) return 'remote';
		if (localOrRemote.endsWith('.git')) return 'remote';
		if (localOrRemote.startsWith('.')) return 'local';
		if (localOrRemote.startsWith('/')) return 'local';
		throw new Error(`Unsupported git path: \n${localOrRemote}`);
	}

	private sanitizeName(name: string): string {
		return name
			.toLowerCase() // all lower case, easy to work with cli
			.replaceAll(' ', '-') // no spaces
			.replaceAll(/[^a-z0-9]/g, ''); // only letters and digits
	}

	/**
	 * @return local path to repository
	 */
	private clone(remote: string): string {
		const path = this.getPath(this.name);
		const cmd = `git clone ${remote} ${path}`;
		ChildProcess.execSync(cmd);
		return path;
	}

	private getPath(subpath?: string): string {
		return Path.resolve(os.tmpdir(), subpath ?? '');
	}
}

type Parameters = {
	name: string;
	localOrRemote: string;
};

export { Repository };
