import { Repository } from './Repository';

class RepositoryFactory {
	public cafe(branch: string): Repository {
		return new Repository({
			name: 'cafe',
			branch: branch,
			remote: 'git@github.com:eventespresso/cafe.git',
		});
	}

	public barista(branch: string): Repository {
		return new Repository({
			name: 'barista',
			branch: branch,
			remote: 'git@github.com:eventespresso/barista.git',
		});
	}

	public e2e(branch: string): Repository {
		return new Repository({
			name: 'e2e-tests',
			branch: branch,
			remote: 'git@github.com:eventespresso/barista.git',
		});
	}
}

export { RepositoryFactory };
