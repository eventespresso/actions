import dotenv from 'dotenv';
import { Repository } from './Repository';
import * as ChildProcess from 'child_process';
import * as core from '@actions/core';

const e2eTests = (): void => {
	dotenv.config({
		path: '../.dotenv',
	});

	// ### prepare cafe repo

	const cafeEnv = core.getInput('cafe-repo');

	if (!cafeEnv) {
		throw new Error('Missing environment variable: CAFE');
	}

	const cafeRepo = new Repository({ name: 'cafe', localOrRemote: cafeEnv });

	cafeRepo.exec('composer install');

	// ### prepare barista repo (optional)

	const baristaEnv = core.getInput('barista-repo');

	if (!baristaEnv) {
		throw new Error('Missing environment variable: BARISTA');
	}

	const baristaRepo = new Repository({ name: 'barista', localOrRemote: baristaEnv });

	baristaRepo.exec('npm ci');

	baristaRepo.exec('yarn build');

	// ### prepare e2e tests repo

	const e2eTestsEnv = core.getInput('e2e-tests-repo');

	if (!e2eTestsEnv) {
		throw new Error('Missing environment variable: E2E_TESTS');
	}

	const e2eTestsRepo = new Repository({ name: 'e2e-tests', localOrRemote: e2eTestsEnv });

	e2eTestsRepo.exec('npm ci');

	// ### prepare environment

	ChildProcess.execSync('sudo apt-get install --yes mkcert');

	ChildProcess.execSync('curl -fsSL https://ddev.com/install.sh | bash');

	ChildProcess.execSync('npx playwright install --with-deps');

	// ### run actual tests

	e2eTestsRepo.exec('yarn test');
};

export default e2eTests;
