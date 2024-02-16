import { SpawnSync } from './SpawnSync';
import { InputFactory } from './InputFactory';
import { ContextFactory } from './ContextFactory';
import { Context } from './Context';
import { Browsers } from './Browsers';
import { log } from './utilities';
import * as core from '@actions/core';
import { Repository } from './Repository';

class Action {
	private readonly browsers: Browsers;

	constructor(
		private readonly inputs: InputFactory,
		private readonly contexts: ContextFactory,
		private readonly spawnSync: SpawnSync
	) {
		this.browsers = new Browsers(this.spawnSync);
	}

	public async run(): Promise<void> {
		const cafe = this.contexts.make('cafe', this.inputs.cafeBranch());
		const barista = this.contexts.make('barista', this.inputs.baristaBranch());
		const e2e = this.contexts.make('e2e', this.inputs.e2eBranch());
		const skipTests = this.inputs.skipTests();
		const skipBarista = this.inputs.baristaBranch().length === 0;

		await cafe.git.clone();

		// it is optional to clone barista repo
		if (!skipBarista) {
			await barista.git.clone();
			await barista.yarn.install({ frozenLockfile: true });
			await barista.yarn.build();
		}

		await e2e.git.clone();
		await e2e.yarn.install({ frozenLockfile: true });

		// install dependencies
		this.mkcert();
		this.ddev();
		this.browsers.install(e2e);

		await this.showGitSummary(skipBarista ? [cafe, e2e] : [cafe, barista, e2e]);

		if (!skipTests) {
			await e2e.yarn.test(this.getEnvVars(cafe, barista));
		}
	}

	private async showGitSummary(contexts: InstanceType<typeof Context>[]): Promise<void> {
		const repos: InstanceType<typeof Repository>[] = contexts.map((context) => {
			return context.repo;
		});
		core.summary.addHeading('Git information');
		core.summary.addTable([
			[
				{ data: 'Repo', header: true },
				{ data: 'Branch', header: true },
				{ data: 'Commit', header: true },
			],
			...repos.map((repo) => {
				return [repo.name, repo.branch, repo.commit.substring(0, 7)];
			}),
		]);
		await core.summary.write();
	}

	private mkcert(): void {
		log('Installing mkcert...');
		this.spawnSync.call('sudo', ['apt-get', 'install', '--yes', 'libnss3-tools', 'mkcert']);
	}

	private getDdevVersion(): string | undefined {
		const version = this.inputs.ddevVersion();
		if (!version) {
			return;
		}
		return 'v' + version;
	}

	private ddev(): void {
		log('Installing DDEV...');
		const curl = this.spawnSync.call('curl', ['-fsSL', 'https://ddev.com/install.sh'], { stdout: 'pipe' });
		const bashArgs: string[] = [];
		const ddevVersion = this.getDdevVersion();
		if (ddevVersion) {
			bashArgs.push('-s');
			bashArgs.push(ddevVersion);
		}
		this.spawnSync.call('bash', bashArgs, { stdin: 'pipe', input: curl.stdout });
	}

	private getEnvVars(cafe: Context, barista: Context): EnvVars {
		const vars: EnvVars = { CAFE: cafe.cwd };
		const baristaBranch = this.inputs.baristaBranch();
		if (baristaBranch.length > 0) {
			vars.BARISTA = barista.cwd;
		}
		return vars;
	}
}

type EnvVars = {
	CAFE: string;
	BARISTA?: string;
};

export { Action };

export type { EnvVars as EnvVars };
