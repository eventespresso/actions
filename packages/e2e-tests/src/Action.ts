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
		// TODO: perhaps cache this as well?
		// https://playwright.dev/docs/library#managing-browser-binaries
		await e2e.call('npx', ['playwright', 'install', '--with-deps']);

		// install dependencies
		this.mkcert();
		this.ddev();

		// TODO: add ability to skip this step to allow cache pre-warm
		await e2e.yarn.test(env);
	}

	private mkcert(): void {
		this.execSync.call('sudo', ['apt-get', 'install', '--yes', 'libnss3-tools', 'mkcert']);
	}

	private ddev(): void {
		const curl = this.execSync.call('curl', ['-fsSL', 'https://ddev.com/install.sh'], { stdout: 'pipe' });
		this.execSync.call('bash', [], { input: curl.stdout });
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
