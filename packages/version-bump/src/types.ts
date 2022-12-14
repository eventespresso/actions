export type BumpType = 'major' | 'minor' | 'patch' | 'build' | 'custom';
export type CustomValue = string | number;
export type FilePath = string;

export interface InfoJson {
	wpOrgPluginName: string;
	wpOrgPluginUrl: string;
	wpOrgRelease: string;
}

export interface Input {
	infoJsonFile: FilePath;
	mainFile: FilePath;
	readmeFile: FilePath;
	bumpType: BumpType;
	customValue?: CustomValue | ReleaseType;
	releaseType?: ReleaseType;
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
	build: number;
	releaseType: ReleaseType;
}
