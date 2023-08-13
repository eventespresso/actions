import { Cache } from './Cache';
import { Repository } from './Repository';

class RepositoryFactory {
	constructor(private readonly cache: Cache) {}

	public cafe(branch: string): Repository {
		return new Repository(
			{
				name: 'cafe',
				branch: branch,
				remote: 'git@github.com:eventespresso/cafe.git',
			},
			this.cache
		);
	}

	public barista(branch: string): Repository {
		return new Repository(
			{
				name: 'barista',
				branch: branch,
				remote: 'git@github.com:eventespresso/barista.git',
			},
			this.cache
		);
	}

	public e2e(branch: string): Repository {
		return new Repository(
			{
				name: 'e2e-tests',
				branch: branch,
				remote: 'git@github.com:eventespresso/barista.git',
			},
			this.cache
		);
	}
}

export { RepositoryFactory };
