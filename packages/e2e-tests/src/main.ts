import dotenv from 'dotenv';
import * as process from 'process';
import { Repository } from './Repository';
import * as child_process from 'child_process';

const e2eTests = (): void => {
	dotenv.config({
		path: '../.dotenv',
	});

	// ### prepare cafe repo

	const cafeEnv = process.env['CAFE'];

	if (!cafeEnv) {
		throw new Error('Missing environment variable: CAFE');
	}

	const cafeRepo = new Repository({ name: 'cafe', localOrRemote: cafeEnv });

	// TODO: cache for composer deps here

	cafeRepo.exec('composer install');

	// ### prepare barista repo (optional)

	const baristaEnv = process.env['BARISTA'];

	if (!baristaEnv) {
		throw new Error('Missing environment variable: BARISTA');
	}

	const baristaRepo = new Repository({ name: 'barista', localOrRemote: baristaEnv });

	// TODO:: barista can be optional as cafe contains all assets

	// TODO: cache for yarn deps here

	baristaRepo.exec('npm ci');

	baristaRepo.exec('yarn build');

	// ### prepare e2e tests repo

	const e2eTestsEnv = process.env['E2E_TESTS'];

	if (!e2eTestsEnv) {
		throw new Error('Missing environment variable: E2E_TESTS');
	}

	const e2eTestsRepo = new Repository({ name: 'e2e-tests', localOrRemote: e2eTestsEnv });

	e2eTestsRepo.exec('npm ci');

	// ### prepare environment

	child_process.execSync('sudo apt-get install --yes mkcert');

	child_process.execSync('curl -fsSL https://ddev.com/install.sh | bash');

	child_process.execSync('npx playwright install --with-deps');

	// ### run actual tests

	e2eTestsRepo.exec('yarn test');
};

export default e2eTests;
