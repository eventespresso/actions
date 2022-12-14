import * as core from '@actions/core';
import { pr, repo } from './utils';
import { assignStatusLabels } from './mutations';
import { getPullRequest } from './queries';

const assignStatusLabelsToPullRequest = async (): Promise<void> => {
	try {
		const results = await getPullRequest(pr);
		// eslint-disable-next-line no-console
		console.log('%c pull request query results', 'color: cyan;', results);

		if (results?.repository?.pullRequest && results.repository.pullRequest !== null) {
			assignStatusLabels(repo, results.repository.pullRequest);
		} else {
			throw new Error(`Could not retrieve a valid Pull Request with ID: ${pr}`);
		}
	} catch (error) {
		core.setFailed(error.message);
	}
};

export default assignStatusLabelsToPullRequest;
