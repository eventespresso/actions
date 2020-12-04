/**
 * Converts a string path to array path
 * that can be used in ramda path functions
 *
 * 'foo[1].bar' to ['foo', '1', 'bar']
 *
 * Source https://github.com/final-form/final-form
 */
export const toPath = (key: string): string[] => {
	if (key === null || key === undefined || !key.length) {
		return [];
	}
	if (typeof key !== 'string') {
		throw new Error('toPath() expects a string');
	}

	return key.split(/[.[\]]+/).filter(Boolean);
};
