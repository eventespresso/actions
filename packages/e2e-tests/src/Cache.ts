import { Repository } from './Repository';
import { error } from './utilities';
import * as core from '@actions/core';
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
		if (k.length > 512) {
			// https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#input-parameters-for-the-cache-action
			const msg = `Cache key exceeded length of 512 chars: \n${k}`;
			core.setFailed(msg);
		}
		return k;
	}
}

export { Cache };
