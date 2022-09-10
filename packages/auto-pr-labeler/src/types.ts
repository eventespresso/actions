export type ID = string | number;
export type RepoName = string;

interface ClosingIssuesReference {
	id: ID;
	name: number;
}

export interface Label {
	id: ID;
	name: string;
}

export interface RepoLabels {
	[key: RepoName]: LabelList;
}

export interface LabelList {
	[key: ID]: Label;
}

export interface LabelsQueryResponse {
	labels: LabelList;
}

interface ReviewRequests {
	totalCount: number;
}

export interface PullRequest {
	closingIssuesReferences: ClosingIssuesReference[];
	id: ID;
	number: number;
	reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
	reviewRequests: ReviewRequests;
	state: 'CLOSED' | 'MERGED' | 'OPEN';
}

export interface PullRequestQueryResponse {
	repository: {
		pullRequest: PullRequest;
	};
}
