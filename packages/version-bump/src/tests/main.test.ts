import * as core from '@actions/core';
import * as io from '@eventespresso-actions/io';
import { checkForDuplicateCases, getMockedFileContents, mainNormalTestCases } from './utils';
import { bumpTypes } from '../utils';
import run from '../main';

import { InputReturn, InputValues } from './types';

const input: InputValues = {
	'info-json-file': 'info.json',
	'main-file': 'main-file.php',
	'readme-file': 'readme.txt',
	'bump-type': 'minor',
	'custom-value': undefined,
	'release-type': 'rc',
};
let output: InputReturn = {};

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

		jest.spyOn(io, 'writeFile').mockImplementation(() => {
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

		for (const { bumpType, inputVer, outputVer, releaseType, customValue } of mainNormalTestCases) {
			// set bump type
			input['bump-type'] = bumpType;
			input['custom-value'] = customValue;
			input['release-type'] = releaseType;
			// set mock to dynamically generate input file
			const contentMock = jest.spyOn(io, 'readFile').mockImplementation((path) => {
				return getMockedFileContents(path as string, inputVer);
			});

			await expect(
				run(
					input['main-file'],
					input['info-json-file'],
					input['ireadme-file'],
					bumpType,
					releaseType,
					customValue
				)
			).resolves.not.toThrow();

			expect(output['new-version']).toBe(outputVer);
			contentMock.mockRestore();
		}
	});

	it('errs for an invalid input', async () => {
		for (const edgeCase of [null, undefined, '', '0', '0.0', '1', '1.0']) {
			for (const bumpType of bumpTypes) {
				// set bump type
				input['bump-type'] = bumpType;
				// set mock to dynamically generate input file
				const contentMock = jest.spyOn(io, 'readFile').mockImplementation((path) => {
					return getMockedFileContents(path as string, edgeCase);
				});

				// fire it
				await expect(
					run(input['main-file'], input['info-json-file'], input['ireadme-file'], bumpType, 'rc')
				).rejects.toThrow();
				contentMock.mockRestore();
			}
		}
	});
});
