import { InputFactory } from './InputFactory';
import { Repository } from './Repository';
import { RepositoryFactory } from './RepositoryFactory';
import * as child_process from 'child_process';

class Action {
	constructor(private readonly inputs: InputFactory, private readonly repos: RepositoryFactory) {}

	public async run(): Promise<void> {
		const cafe = this.getCafe();
		const barista = this.getBarista();
		const e2e = this.getE2E();

		await cafe.clone();

		// it is optional to clone barista repo
		if (this.inputs.getBaristaRepoBranch()) {
			await barista.clone();
			barista.exec('yarn install --frozen-lockfile');
			barista.exec('yarn build');
		}

		this.installDependencies();

		const env: Record<string, string> = {};

		env['CAFE'] = cafe.cwd;

		if (barista) {
			env['BARISTA'] = barista.cwd;
		}

		await e2e.clone();

		// TODO: once e2e-tests package is extracted from Barista repository, update the .exec() command
		e2e.exec('yarn install --frozen-lockfile');
		e2e.exec(`yarn workspace @eventespresso/e2e test`, env);
	}

	private makeEnvVars(...repos: (Repository | undefined)[]): string {
		return repos
			.filter((any): any is Repository => {
				return typeof any === 'object' && any.constructor.name === Repository.name;
			})
			.map((r) => `${r.name}=${r.cwd}`)
			.join(' ');
	}

	private getCafe(): Repository {
		return this.repos.cafe(this.inputs.getCafeRepoBranch());
	}

	private getBarista(): Repository {
		return this.repos.barista(this.inputs.getBaristaRepoBranch());
	}

	private getE2E(): Repository {
		return this.repos.e2e(this.inputs.getE2ETestsRepoBranch());
	}

	private installDependencies(): void {
		const cmds = [
			'sudo apt-get install --yes libnss3-tools mkcert',
			'curl -fsSL https://ddev.com/install.sh | bash',
			'npx playwright install --with-deps',
		];
		for (const cmd of cmds) {
			child_process.execSync(cmd);
		}
	}
}

export { Action };
