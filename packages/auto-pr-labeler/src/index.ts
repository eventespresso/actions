import { assignStatusLabels } from './mutations';
import core from '@actions/core';
import { getPullRequest } from './queries';

const assignStatusLabelsToPullRequest = async (): Promise<void> => {
	const org = core.getInput('org', { required: true }) || 'eventespresso';
	const repo = core.getInput('repo', { required: true }) || 'barista';
	const pr = Number(core.getInput('pr', { required: true }));
	const token = core.getInput('token', { required: true });

	// eslint-disable-next-line no-console
	console.log('%c organization', 'color: LimeGreen;', org);
	// eslint-disable-next-line no-console
	console.log('%c repository', 'color: Yellow;', pr);
	// eslint-disable-next-line no-console
	console.log('%c pull request #', 'color: HotPink;', pr);

	const { pullRequest } = await getPullRequest(org, repo, pr, token);

	if (pullRequest) {
		assignStatusLabels(pullRequest, token);
	}
};

try {
	assignStatusLabelsToPullRequest();
} catch (error) {
	core.setFailed(error.message);
}
