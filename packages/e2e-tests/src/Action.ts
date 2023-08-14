import { ExecSync } from './ExecSync';
import { InputFactory } from './InputFactory';
import { ContextFactory } from './ContextFactory';
import { Context } from './Context';

class Action {
	constructor(
		private readonly inputs: InputFactory,
		private readonly contexts: ContextFactory,
		private readonly execSync: ExecSync
	) {}

	public async run(): Promise<void> {
		const cafe = this.contexts.make('cafe', this.inputs.cafeBranch());
		const barista = this.contexts.make('barista', this.inputs.baristaBranch());
		const e2e = this.contexts.make('e2e', this.inputs.e2eBranch());
		const env = this.getEnv(cafe, barista);

		await cafe.git.clone();

		// it is optional to clone barista repo
		if (this.inputs.baristaBranch()) {
			await barista.git.clone();
			await barista.yarn.install({ frozenLockfile: true });
			await barista.yarn.build();
		}

		// TODO: once e2e-tests package is extracted, update this

		await e2e.git.clone();
		await e2e.yarn.install({ frozenLockfile: true });
		await e2e.yarn.test(env);

		this.installDependencies();
	}

	private installDependencies(): void {
		const cmds = [
			'sudo apt-get install --yes libnss3-tools mkcert',
			'curl -fsSL https://ddev.com/install.sh | bash',
			'npx playwright install --with-deps',
		];
		for (const cmd of cmds) {
			this.execSync.void(cmd);
		}
	}

	private getEnv(cafe: Context, barista?: Context): Record<string, string> {
		const env: Record<string, string> = { CAFE: cafe.cwd };
		if (barista) {
			env['BARISTA'] = barista.cwd;
		}
		return env;
	}
}

export { Action };
