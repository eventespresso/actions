export interface Label {
	name: string;
	id: string;
}

export interface LabelList {
	[key: string]: Label;
}

export interface LabelsQueryResponse {
	labels: Label;
}

export interface PullRequest {
	id: string;
	number: number;
	reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
	state: 'CLOSED' | 'MERGED' | 'OPEN';
}

export interface PullRequestQueryResponse {
	repository: {
		pullRequest: PullRequest;
	};
}
