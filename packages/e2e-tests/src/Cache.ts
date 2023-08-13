import * as core from '@actions/core';
import * as cache from '@actions/cache';

class Cache {
	constructor() {
		if (!cache.isFeatureAvailable()) {
			core.error('Cache service is not available');
		}
	}

	/**
	 * @param key
	 * @param paths
	 * @returns cache id or false is service failed
	 */
	public async save(key: string, paths: string[]): Promise<number | false> {
		try {
			return await cache.saveCache(paths, key);
		} catch (error) {
			core.error(`Failed to save cache with key ${key}`);
			core.error(error as string);
			return false;
		}
	}

	public async restore(key: string, paths: string[], optKeys?: string[]): Promise<boolean> {
		const restore = await cache.restoreCache(paths, key, optKeys);
		if (typeof restore === 'undefined') {
			core.notice(`Did not find cache with key ${key}`);
			return false;
		}
		return true;
	}
}

export { Cache };
