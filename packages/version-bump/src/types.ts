export type BumpType = 'major' | 'minor' | 'patch' | 'release_type' | 'build';
export type BumpValue = string | number;

export interface InfoJson {
	wpOrgPluginName: string;
	wpOrgPluginUrl: string;
	wpOrgRelease: string;
}

export interface Input {
	infoJsonFile: string;
	mainFile: string;
	readmeFile: string;
	releaseType?: ReleaseType;
	value?: BumpValue | ReleaseType;
	type: BumpType;
}

export type ReleaseType = 'alpha' | 'beta' | 'decaf' | 'rc' | 'p';

export interface VersionInfo {
	releaseType: ReleaseType;
	newVersion: string;
	updateInfoJson: boolean;
}

export interface VersionParts {
	major: number;
	minor: number;
	patch: number;
	releaseType: ReleaseType;
	build: number;
}
