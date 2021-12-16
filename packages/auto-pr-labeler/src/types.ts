type ID = string;

export interface Label {
	name: string;
	id: ID;
}

export interface LabelList {
	[key: ID]: Label;
}

export interface LabelsQueryResponse {
	labels: Label;
}

export interface PullRequest {
	id: ID;
	number: number;
	reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
	state: 'CLOSED' | 'MERGED' | 'OPEN';
}

export interface PullRequestQueryResponse {
	repository: {
		pullRequest: PullRequest;
	};
}
