import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { SpawnSync } from './SpawnSync';

/**
 * This class add ability to save and restore docker images
 * Currently, it is not in use due to sub-optimal performance results
 * https://github.com/eventespresso/barista/issues/1222#issuecomment-1684280811
 */
class Docker {
	constructor(private readonly spawnSync: SpawnSync) {}

	public async saveImages(): Promise<boolean> {
		const [fileName, workDir, filePath] = this.getParams();
		core.notice(`Saving docker images to cache: ${fileName}`);
		const imagesList = this.listImages();
		this.spawnSync.call('docker', ['save', '--output', filePath, ...imagesList]);
		if (!fs.existsSync(filePath)) {
			core.error(`Failed to save docker images at ${filePath}`);
			return false;
		}
		try {
			await cache.saveCache([filePath], fileName);
		} catch (error) {
			core.error('Failed to save docker images into cache');
			core.error(error as string);
			return false;
		}
		return true;
	}

	public async loadImages(): Promise<boolean> {
		const [fileName, workDir, filePath] = this.getParams();
		let restore = undefined;
		try {
			restore = await cache.restoreCache([filePath], fileName, [], {});
		} catch (error) {
			core.notice('Failed to restore docker images from cache');
			core.notice(error as string);
			return false;
		}
		if (!restore) {
			core.notice('No cache found for docker images');
			return false;
		}
		this.spawnSync.call('docker', ['load', '--input', filePath]);
		return true;
	}

	private listImages(): string[] {
		return this.spawnSync
			.call('docker', ['images', '--quiet'], {
				stdout: 'pipe',
			})
			.stdout.trim()
			.split('\n');
	}

	/**
	 * @return {[string,string,string]} [filename, workdir, full path]
	 */
	private getParams(): [string, string, string] {
		const fileName = 'docker-images.tar';
		const workDir = os.tmpdir();
		const filePath = path.resolve(workDir, fileName);
		return [fileName, workDir, filePath];
	}
}

export { Docker };
