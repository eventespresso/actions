import { SpawnSync } from './SpawnSync';
import { error, log, notice } from './utilities';
import * as cache from '@actions/cache';
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * This class add ability to save and restore docker images
 * Currently, it is not in use due to sub-optimal performance results
 * https://github.com/eventespresso/barista/issues/1222#issuecomment-1684280811
 */
class Docker {
	constructor(private readonly spawnSync: SpawnSync) {}

	public async saveImages(): Promise<boolean> {
		const [fileName, workDir, filePath] = this.getParams();
		log('Saving docker images to cache: ' + fileName);
		const imagesList = this.listImages();
		this.spawnSync.call('docker', ['save', '--output', filePath, ...imagesList]);
		if (!fs.existsSync(filePath)) {
			error('Failed to save docker images at', 'File path: ' + filePath);
			return false;
		}
		try {
			await cache.saveCache([filePath], fileName);
		} catch (err) {
			error('Failed to save docker images into cache', `${err}`);
			return false;
		}
		return true;
	}

	public async loadImages(): Promise<boolean> {
		const [fileName, workDir, filePath] = this.getParams();
		let restore = undefined;
		try {
			restore = await cache.restoreCache([filePath], fileName, [], {});
		} catch (err) {
			error('Failed to restore docker images from cache', `${err}`);
			return false;
		}
		if (!restore) {
			notice('No cache found for docker images');
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
