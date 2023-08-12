import { Repository } from './Repository';

class RepositoryFactory {
	constructor() {}

	public cafe(branch: string = 'DEV'): Repository {
		return new Repository({
			name: 'cafe',
			branch: branch,
			remote: 'git@github.com:eventespresso/cafe.git',
		});
	}

	public barista(branch: string = 'master'): Repository {
		return new Repository({
			name: 'barista',
			branch: branch,
			remote: 'git@github.com:eventespresso/barista.git',
		});
	}

	public e2e(branch: string = 'master'): Repository {
		return new Repository({
			name: 'e2e-tests',
			branch: branch,
			remote: 'git@github.com:eventespresso/barista.git',
		});
	}
}

export { RepositoryFactory };
