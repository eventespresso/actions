import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import { getInput } from '../utils';

import { InputReturn } from './types';

// Input for mock @actions/core
let input: InputReturn = {};

describe('version bump getInput tests', () => {
	beforeAll(() => {
		// Mock getInput
		jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
			return input[name];
		});
		jest.spyOn(io, 'existsSync').mockImplementation((name: string) => {
			return ['info.json', 'main-file.php', 'readme.txt'].includes(name);
		});
	});

	beforeEach(() => {
		// Reset inputs
		input = {};
	});

	afterAll(() => {
		// Restore
		jest.restoreAllMocks();
	});

	it('throws error if input not provided', () => {
		expect(() => getInput()).toThrow();
	});

	it('throws does not throw error if input IS provided', () => {
		input = {
			'info-json-file': 'info.json',
			'main-file': 'main-file.php',
			'readme-file': 'readme.txt',
			'bump-type': 'minor',
		};
		expect(() => getInput()).not.toThrow();
	});

	it('returns the given input', () => {
		input = {
			'info-json-file': 'info.json',
			'main-file': 'main-file.php',
			'readme-file': 'readme.txt',
			'bump-type': 'patch',
		};
		const _input = getInput();
		expect(_input.infoJsonFile).toBe(input['info-json-file']);
		expect(_input.mainFile).toBe(input['main-file']);
		expect(_input.readmeFile).toBe(input['readme-file']);
		expect(_input.bumpType).toBe(input['bump-type']);
	});
});
