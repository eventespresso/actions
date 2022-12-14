import * as core from '@actions/core';
import * as github from '@actions/github';
import { existsSync, readFileSync, writeFileSync } from '@eventespresso-actions/io';

(async () => {
	try {
		const PAYLOAD = github.context?.payload;
		// if (PAYLOAD.action !== 'closed' && PAYLOAD.pull_request.merged !== true) {
		// 	return;
		// }

		const repo = github.context?.repo?.repo;
		const owner = github.context?.repo?.owner;
		if (!repo || !owner) {
			core.setFailed(`WUT?!?! The repo and/or owner data is missing from the payload?!?!? `);
		}

		const pullRequest = PAYLOAD.pull_request;
		const base = pullRequest.base?.sha;
		const head = pullRequest.head?.sha;
		if (!base || !head) {
			core.setFailed(`OH NOES?!?! The base and head commits are missing from the payload?!?!? `);
		}

		const GITHUB_TOKEN = core.getInput('token', { required: true });
		const octokit = github.getOctokit(GITHUB_TOKEN);

		// https://developer.github.com/v3/repos/commits/#compare-two-commits
		const comparison = await octokit.rest.repos.compareCommits({
			owner,
			repo,
			base,
			head,
		});

		if (comparison?.status !== 200) {
			core.setFailed(`GitHub.repos.compareCommits() failed for commits base: ${base} and head: ${head}`);
		}

		if (comparison.data.status !== 'ahead') {
			core.setFailed('The BASE is ahead of HEAD but HEAD should be ahead of BASE!?!?.');
		}
		const files = comparison.data.files;

		const plugins = [];

		let pathParts: Array<string>;
		let pluginName: string;
		for (const file of files) {
			// plugins/eea-wait-lists/acceptance_tests/Page/WaitListsGeneral.php
			pathParts = file.filename.split('/');

			core.info(`filename: ${file.filename}`);
			if (pathParts[0] === 'plugins' && pathParts[1] !== undefined) {
				pluginName = pathParts[1];
				if (!plugins.includes(pluginName)) {
					plugins.push(pluginName);
					core.info(`plugin: ${pluginName}`);
				}
			}
		}

		let changelogPath: string;
		let changelogEntry: string;
		let changelogContents: string;
		const PLACEHOLDER = '<changelog_entry>';
		for (const plugin of plugins) {
			changelogContents = PLACEHOLDER;
			changelogPath = `plugins/${plugin}/CHANGELOG.md`;
			core.info(`changelogPath: ${changelogPath}`);

			if (existsSync(changelogPath)) {
				changelogContents = readFileSync(changelogPath, { encoding: 'utf8' });
			}

			changelogEntry = pullRequest.title;
			core.info(`changelogEntry: ${changelogEntry}`);
			changelogEntry += PLACEHOLDER;

			changelogContents = changelogContents.replace(PLACEHOLDER, changelogEntry);
			writeFileSync(changelogPath, changelogContents, { encoding: 'utf8' });
		}
	} catch (error) {
		core.setFailed(error.message);
	}
})();
