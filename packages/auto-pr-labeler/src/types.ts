import { PR_REVIEW_DECISION, PR_STATE } from './constants';

export type ID = string | number;
export type RepoName = string;

export interface Issue {
	assignees: UserConnection;
	id: ID;
	labels: LabelConnection;
	number: number;
	title: string;
}

export interface IssueConnection {
	nodes: Issue[];
	totalCount: number;
}

export interface Label {
	id: ID;
	name: string;
}

export interface LabelConnection {
	nodes: Label[];
	totalCount: number;
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
	assignees: UserConnection;
	closingIssuesReferences: IssueConnection;
	id: ID;
	labels: LabelConnection;
	number: number;
	reviewDecision: PullRequestReviewDecision;
	reviewRequests: ReviewRequests;
	state: PullRequestState;
}

type PrReviewDecisionValues<T> = T[keyof T];
type PullRequestReviewDecision = PrReviewDecisionValues<typeof PR_REVIEW_DECISION>;

type PrStateValues<T> = T[keyof T];
type PullRequestState = PrStateValues<typeof PR_STATE>;

export interface PullRequestQueryResponse {
	repository: {
		pullRequest: PullRequest;
	};
}

interface User {
	id: ID;
	login: string;
}

export interface UserConnection {
	nodes: User[];
	totalCount: number;
}
