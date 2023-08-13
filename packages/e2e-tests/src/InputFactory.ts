import * as core from '@actions/core';

class InputFactory {
	public getCafeRepoBranch(): string {
		return core.getInput('cafe_repo_branch', { required: true });
	}

	public getBaristaRepoBranch(): string {
		return core.getInput('barista_repo_branch', { required: false });
	}

	public getE2ETestsRepoBranch(): string {
		return core.getInput('e2e_tests_repo_branch', { required: true });
	}
}

export { InputFactory };
