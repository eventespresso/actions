import { BumpType, CustomValue, ReleaseType } from '../types';

export type InputReturn = Record<string, string>;

export type InputValues = {
	'info-json-file': string;
	'main-file': string;
	'readme-file': string;
	'bump-type': string;
	'custom-value'?: CustomValue | ReleaseType;
	'release-type'?: ReleaseType;
};

export type MainTestCase = {
	bumpType: BumpType;
	inputVer: string;
	outputVer: string;
	releaseType?: ReleaseType;
	customValue?: CustomValue | ReleaseType;
};
