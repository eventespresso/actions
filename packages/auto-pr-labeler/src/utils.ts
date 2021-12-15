import { graphql } from '@octokit/graphql';
import type { graphql as iGraphql } from '@octokit/graphql/dist-types/types';

export const graphqlWithAuth = (token: string): iGraphql =>
	graphql.defaults({
		headers: {
			authorization: token,
		},
	});
