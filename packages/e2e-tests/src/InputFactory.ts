import * as core from '@actions/core';

class InputFactory {
	public getCafeRepoBranch(): string {
		return core.getInput('cafe-repo-branch', { required: true });
	}

	public getBaristaRepoBranch(): string {
		return core.getInput('barista-repo-branch', { required: false });
	}

	public getE2ETestsRepoBranch(): string {
		return core.getInput('e2e-tests-repo-branch', { required: true });
	}
}

export { InputFactory };
