import { Context } from './Context';
import { SpawnSync } from './SpawnSync';
import * as os from 'os';
import * as path from 'path';

class Browsers {
	constructor(private readonly spawnSync: SpawnSync) {}

	public install(ctx: Context): void {
		this.installBrowsers(ctx);
		this.initChromium(ctx);
		this.initFirefox(/* ctx */);
		this.importCARoot();
	}

	private installBrowsers(ctx: Context): void {
		// npx will attempt to use local packages first
		// hence we need to use repo context here instead of global
		ctx.call('npx', ['playwright', 'install', '--with-deps']);
	}

	private importCARoot(): void {
		// import mkcert root CA to browsers
		// do *NOT* use sudo here
		// https://github.com/microsoft/playwright/issues/4785#issuecomment-1133864469
		this.spawnSync.call('mkcert', ['-install']);
	}

	private initChromium(ctx: Context): void {
		// initialize browsers security stores (SSL stores)
		// https://github.com/microsoft/playwright/issues/4785#issuecomment-1385011931
		ctx.call('npx', [
			'playwright',
			'screenshot',
			'--browser',
			'chromium',
			'https://www.google.com',
			path.resolve(os.tmpdir(), 'init-browser-stores.png'),
		]);
	}

	private initFirefox(/* ctx: Context */): void {
		// blocked by https://github.com/FiloSottile/mkcert/pull/520
		// mkcert does not support firefox-nightly cert store which is what Playwright uses for Firefox browser (Nightly as opposed to stable)
		// workaround would be problematic because ddev detects presence
		// of mkcert and automatically sets up WP with https instead of http
		// https://stackoverflow.com/a/65111281/4343719
		// it seems easier for now to block FireFox testing and wait for PR#520
		// ctx.call('npx', [
		// 	'playwright',
		// 	'screenshot',
		// 	'--browser',
		// 	'firefox',
		// 	'https://www.google.com',
		// 	path.resolve(os.tmpdir(), 'init-browser-stores.png'),
		// ]);
	}
}

export { Browsers };
