import { SpawnSync } from './SpawnSync';
import { InputFactory } from './InputFactory';
import { ContextFactory } from './ContextFactory';
import { Context } from './Context';
import * as core from '@actions/core';
import { Browsers } from './Browsers';

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

		await cafe.git.clone();

		// it is optional to clone barista repo
		if (this.inputs.baristaBranch()) {
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

		if (!skipTests) {
			await e2e.yarn.test(this.getEnvVars(cafe, barista));
		}
	}

	private mkcert(): void {
		core.info('Installing mkcert');
		this.spawnSync.call('sudo', ['apt-get', 'install', '--yes', 'libnss3-tools', 'mkcert']);
	}

	private ddev(): void {
		core.info('Installing DDEV');
		const curl = this.spawnSync.call('curl', ['-fsSL', 'https://ddev.com/install.sh'], { stdout: 'pipe' });
		this.spawnSync.call('bash', [], { stdin: 'pipe', input: curl.stdout });
	}

	private getEnvVars(cafe: Context, barista?: Context): EnvVars {
		const vars: EnvVars = { CAFE: cafe.cwd };
		if (barista) {
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
