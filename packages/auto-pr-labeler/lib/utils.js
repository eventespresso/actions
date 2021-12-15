"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlWithAuth = void 0;
const graphql_1 = require("@octokit/graphql");
const graphqlWithAuth = (token) => graphql_1.graphql.defaults({
    headers: {
        authorization: token,
    },
});
exports.graphqlWithAuth = graphqlWithAuth;
