import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import run from '../main';
import { getMockedFileContents } from './utils';

const input = {
	'info-json-file': 'info.json',
	'main-file': 'main-file.php',
	'readme-file': 'readme.txt',
	type: 'pre_release',
};
let output: Record<string, string> = {};

const testCases = [
	{
		type: 'pre_release',
		inputVer: '4.10.9.rc.011',
		outputVer: '4.10.9.beta',
	},
	{
		type: 'minor',
		inputVer: '4.10.9.rc.011',
		outputVer: '4.11.0.p',
	},
];

describe('version bump main tests', () => {
	beforeAll(() => {
		// Mock getInput
		jest.spyOn(core, 'getInput').mockImplementation((name) => {
			return input[name];
		});

		jest.spyOn(core, 'setOutput').mockImplementation((name, value) => {
			output[name] = value;
		});

		jest.spyOn(io, 'existsSync').mockImplementation((name) => {
			return ['info.json', 'main-file.php', 'readme.txt'].includes(name as string);
		});

		jest.spyOn(io, 'writeFileSync').mockImplementation(() => {
			// do something here
		});
	});

	beforeEach(() => {
		output = {};
	});

	afterAll(() => {
		// Restore
		jest.restoreAllMocks();
	});

	it('returns the given input', () => {
		for (const { type, inputVer, outputVer } of testCases) {
			// set bump type
			input.type = type;
			// set mock to dynamically generate input file
			const contentMock = jest.spyOn(io, 'readFileSync').mockImplementation((path) => {
				return getMockedFileContents(path as string, inputVer);
			});
			// fire it
			run();
			expect(output['new-version']).toBe(outputVer);
			contentMock.mockRestore();
		}
	});
});
