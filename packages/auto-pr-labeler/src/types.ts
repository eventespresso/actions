export type ID = string | number;
export type RepoName = string;

interface Assignee {
	id: ID;
	login: string;
}

export interface ClosingIssuesReference {
	id: ID;
	number: number;
	title: string;
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
	assignees: { nodes: Assignee[] };
	closingIssuesReferences: { nodes: ClosingIssuesReference[] };
	id: ID;
	labels: { nodes: Label[] };
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
