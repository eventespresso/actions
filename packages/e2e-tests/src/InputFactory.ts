import core from '@actions/core';

class InputFactory {
	constructor() {}

	public getCafeRepoBranch(): string {
		return core.getInput('cafe-repo-branch', { required: true });
	}

	public useBaristaRepo(): boolean {
		return core.getBooleanInput('use-barista-repo', { required: true });
	}

	public getBaristaRepoBranch(): string {
		return core.getInput('barista-repo-branch', { required: false });
	}

	public getE2ETestsRepoBranch(): string {
		return core.getInput('e2e-tests-repo-branch', { required: true });
	}
}

export { InputFactory };
