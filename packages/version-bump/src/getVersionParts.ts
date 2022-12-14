import { filter } from 'ramda';
import { DEFAULT_VERSION_PARTS, EE_VERSION_REGEX } from './utils';

import type { VersionParts } from './types';

export function getVersionParts(currentVersion: string): VersionParts {
	const versionPartsMatch = currentVersion.match(EE_VERSION_REGEX);
	if (!versionPartsMatch?.groups) {
		throw new Error('Invalid version! Version does not match the pattern');
	}
	// remove empty matches from groups to avoid them overriding defaults
	const nonEmptyVersionParts = filter(Boolean, versionPartsMatch?.groups);
	// build version parts by setting defaults
	const versionParts = { ...DEFAULT_VERSION_PARTS, ...nonEmptyVersionParts };
	console.log({ versionParts });

	return versionParts;
}
