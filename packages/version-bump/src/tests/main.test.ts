import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import { checkForDuplicateCases, getMockedFileContents, mainNormalTestCases } from './utils';
import { bumpTypes } from '../utils';
import run from '../main';

const input = {
	'info-json-file': 'info.json',
	'main-file': 'main-file.php',
	'readme-file': 'readme.txt',
	type: 'minor',
	value: null,
	'release-type': null,
};
let output: Record<string, string> = {};

describe('version bump main tests', () => {
	beforeAll(() => {
		// Mock getInput
		jest.spyOn(core, 'getInput').mockImplementation((name) => {
			return input[name];
		});

		jest.spyOn(core, 'setOutput').mockImplementation((name, value) => {
			output[name] = value;
		});

		jest.spyOn(core, 'setFailed').mockImplementation((message) => {
			throw new Error(message as string);
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

	it('returns the expected output for a given input', async () => {
		checkForDuplicateCases(mainNormalTestCases);

		for (const { type, inputVer, outputVer, releaseType, value } of mainNormalTestCases) {
			// set bump type
			input.type = type;
			input.value = value;
			input['release-type'] = releaseType;
			// set mock to dynamically generate input file
			const contentMock = jest.spyOn(io, 'readFileSync').mockImplementation((path) => {
				return getMockedFileContents(path as string, inputVer);
			});

			await expect(run()).resolves.not.toThrowError();

			expect(output['new-version']).toBe(outputVer);
			contentMock.mockRestore();
		}
	});

	it('errs for an invalid input', async () => {
		for (const edgeCase of [null, undefined, '', '0', '0.0', '1', '1.0']) {
			for (const type of bumpTypes) {
				// set bump type
				input.type = type;
				// set mock to dynamically generate input file
				const contentMock = jest.spyOn(io, 'readFileSync').mockImplementation((path) => {
					return getMockedFileContents(path as string, edgeCase);
				});

				// fire it
				await expect(run()).rejects.toThrowError();
				contentMock.mockRestore();
			}
		}
	});
});
