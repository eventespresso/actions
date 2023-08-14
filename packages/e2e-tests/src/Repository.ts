import * as os from 'os';
import * as fs from 'fs';
import * as Path from 'path';
import * as core from '@actions/core';
import * as ChildProcess from 'child_process';
import { Cache } from './Cache';

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

	constructor(params: Parameters, private readonly cache: Cache) {
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

	/**
	 * Execute given command in working directory of the repository
	 */
	public exec(command: string, env: Record<string, string> = {}): Repository {
		const node = process.execPath;
		const [arg0, args] = this.extractBinFromArgs(command);
		switch (arg0) {
			case 'node':
				this.callBinWithArgs(`${node}`, args, env);
				break;
			case 'yarn':
			case 'npm':
				this.callBinWithArgs(`${node} ${this.which(arg0)}`, args, env);
				break;
			default:
				this.callBinWithArgs(arg0, args, env);
		}
		return this;
	}

	private callBinWithArgs(bin: string, args: string[] = [], env: Record<string, string> = {}): Repository {
		const stderr = ChildProcess.spawnSync(bin, args, {
			shell: true,
			stdio: ['inherit', 'inherit', 'pipe'],
			cwd: this.cwd,
			env: { ...process.env, ...env },
			argv0: process.execArgv.join(' '),
		});
		if (stderr.status !== 0) {
			const msg = [
				`Failed to execute command!`,
				`bin: ${bin}`,
				`args: ${args.join(', ')}`,
				`env: ${JSON.stringify(env, undefined, 2)}`,
				'stderr:',
				stderr.stderr.toString(),
			] as const;
			core.setFailed(msg.join('\n'));
		}
		return this;
	}

	private which(bin: string): string {
		return ChildProcess.execSync(`which ${bin}`).toString().trim();
	}

	private extractBinFromArgs(command: string): [string, string[]] {
		const [arg0, ...args] = command.split(' ');
		return [arg0, args];
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

	public async clone(): Promise<Repository> {
		const cacheKey = this.getCacheKey();
		const optKeys = this.getOptCacheKeys();
		const cloneFromRemote = () =>
			ChildProcess.execSync(
				`git clone --branch ${this.branch} --single-branch --no-tags ${this.remote} ${this.cwd}`
			);
		const cloneFromCache = (): Promise<boolean> => {
			return this.cache.restore(cacheKey, [this.cwd], optKeys);
		};
		if (await cloneFromCache()) {
			core.info(`Found git repository '${this.name}' in cache`);
			return this;
		}
		core.notice(`Did not find git repository '${this.name}' in cache, cloning from remote`);
		cloneFromRemote();
		await this.cache.save(cacheKey, [this.cwd]);
		return this;
	}

	private getCacheKey(): string {
		return `git-${this.name}-${this.branch}-${this.getLastCommitSha()}`;
	}

	private getOptCacheKeys(): string[] {
		return [`git-${this.name}-${this.branch}-`, `git-${this.name}-`, 'git-'];
	}

	private getLastCommitSha(): string {
		// courtesy of https://stackoverflow.com/a/24750310/4343719
		return ChildProcess.execSync(`git ls-remote ${this.remote} HEAD | awk '{ print $1}'`).toString();
	}
}

export { Repository };
