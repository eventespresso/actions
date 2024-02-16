import { Repository } from './Repository';
import { error, annotation } from './utilities';
import * as cache from '@actions/cache';

class Cache {
	constructor(private readonly repo: Repository) {
		if (!cache.isFeatureAvailable()) {
			error('Cache service is not available');
		}
	}

	/**
	 * @returns cache id or false if saving failed
	 */
	public async save(key: string, paths: string[]): Promise<number | false> {
		const k = this.makeKey(key);
		try {
			// .slice() is a required workaround until GitHub fixes cache
			// https://github.com/actions/toolkit/issues/1377
			return await cache.saveCache(paths.slice(), k);
		} catch (err) {
			error('Failed to save cache with key:' + k, 'Error: ' + `${err}`);
			return false;
		}
	}

	public async restore(key: string, paths: string[]): Promise<boolean> {
		const k = this.makeKey(key);
		let restore = undefined;
		try {
			// .slice() is a required workaround until GitHub fixes cache
			// https://github.com/actions/toolkit/issues/1377
			restore = await cache.restoreCache(paths.slice(), k);
		} catch (err) {
			error(`${err}`);
		}
		if (typeof restore === 'undefined') {
			error(`Failed to retrieve cache with key: \n${k}`);
			return false;
		}
		return true;
	}

	private makeKey(key: string): string {
		// generate contextual key since we are dealing with multiple repositories
		const k = `repo-${this.repo.name}-${this.repo.branch}-${key}`;
		const limit = 512; // https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#input-parameters-for-the-cache-action
		if (k.length > limit) {
			annotation(`Cache key exceeded length of ${limit} chars: ` + k);
			throw new Error();
		}
		return k;
	}
}

export { Cache };
