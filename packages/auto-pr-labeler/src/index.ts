import * as core from '@actions/core';
import { assignStatusLabels } from './mutations';
import { getPullRequest } from './queries';
import { pr } from './utils';

const assignStatusLabelsToPullRequest = async (): Promise<void> => {
	const results = await getPullRequest(pr);
	// eslint-disable-next-line no-console
	console.log('%c pull request query results', 'color: cyan;', results);

	if (results?.repository?.pullRequest) {
		// eslint-disable-next-line no-console
		console.log('%c pull request', 'color: cyan;', results.repository.pullRequest);
		assignStatusLabels(results.repository.pullRequest);
	}
};

try {
	assignStatusLabelsToPullRequest();
} catch (error) {
	core.setFailed(error.message);
}
