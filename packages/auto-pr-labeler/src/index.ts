import * as core from '@actions/core';
import { assignStatusLabels } from './mutations';
import { getPullRequest } from './queries';

try {
	const assignStatusLabelsToPullRequest = async (): Promise<void> => {
		const pr = Number(core.getInput('prNumber', { required: true }));
		// eslint-disable-next-line no-console
		console.log('%c pull request #', 'color: HotPink;', pr);

		const { pullRequest } = await getPullRequest(pr);
		// eslint-disable-next-line no-console
		console.log('%c pull request', 'color: cyan;', pullRequest);

		if (pullRequest) {
			assignStatusLabels(pullRequest);
		}
	};

	assignStatusLabelsToPullRequest();
} catch (error) {
	core.setFailed(error.message);
}
