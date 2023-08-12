import { InputFactory } from './InputFactory';
import { Repository } from './Repository';
import { RepositoryFactory } from './RepositoryFactory';

class Action {
	constructor(private readonly inputs: InputFactory, private readonly repos: RepositoryFactory) {}

	public run(): void {
		this.getCafe().clone().exec('composer install');

		if (this.inputs.getBaristaRepoBranch()) {
			this.getBarista().clone().exec('npm ci').exec('yarn build');
		}

		// TODO: once e2e-tests package is extracted from Barista repository, update the .exec() command
		this.getE2E().clone().exec('npm ci').exec('yarn workspace @eventespresso/e2e test');
	}

	private getCafe(): Repository {
		return this.repos.cafe(this.inputs.getBaristaRepoBranch());
	}

	private getBarista(): Repository {
		return this.repos.barista(this.inputs.getBaristaRepoBranch());
	}

	private getE2E(): Repository {
		return this.repos.e2e(this.inputs.getE2ETestsRepoBranch());
	}
}

export { Action };
