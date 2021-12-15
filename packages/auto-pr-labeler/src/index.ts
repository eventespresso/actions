import * as core from '@actions/core';
import { assignStatusLabels } from './mutations';
import { getPullRequest } from './queries';

try {
	const assignStatusLabelsToPullRequest = async (): Promise<void> => {
		const org = core.getInput('org', { required: true }) || 'eventespresso';
		const repo = core.getInput('repo', { required: true }) || 'barista';
		const pr = Number(core.getInput('prNumber', { required: true }));
		const token = core.getInput('token', { required: true });

		// eslint-disable-next-line no-console
		console.log('%c organization', 'color: LimeGreen;', org);
		// eslint-disable-next-line no-console
		console.log('%c repository', 'color: Yellow;', repo);
		// eslint-disable-next-line no-console
		console.log('%c pull request #', 'color: HotPink;', pr);

		const { pullRequest } = await getPullRequest(org, repo, pr, token);

		if (pullRequest) {
			assignStatusLabels(pullRequest, token);
		}
	};

	assignStatusLabelsToPullRequest();
} catch (error) {
	core.setFailed(error.message);
}
