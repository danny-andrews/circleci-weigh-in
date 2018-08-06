import {camelizeKeys, decamelizeKeys} from 'humps';
import R from 'ramda';
import {
  GitHubFetchErr,
  GitHubAuthorizationErr,
  GitHubInvalidResponseErr
} from '../core/errors';
import {NoResponseError, Non200ResponseError, InvalidResponseError, switchCaseF}
  from '../shared';
import {request} from './base';

/* eslint-disable no-magic-numbers */
const Statuses = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
};
/* eslint-enable no-magic-numbers */

const isAuthError = status => R.contains(status, [
  Statuses.UNAUTHORIZED,
  Statuses.FORBIDDEN
]);

const serializer = payload => JSON.stringify(decamelizeKeys(payload));
const deserializer = payload => camelizeKeys(payload);
const HOSTNAME = 'https://api.github.com';

const mapError = ({url, context}) =>
  switchCaseF(
    new Map([
      [NoResponseError, GitHubFetchErr(url, context)],
      [InvalidResponseError, GitHubInvalidResponseErr(url, context)],
      [
        Non200ResponseError,
        () => isAuthError(context.status)
          ? GitHubAuthorizationErr(url, context.data)
          : GitHubInvalidResponseErr(url, context.data)
      ]
    ])
  )();

export default ({path, githubApiToken, fetchOpts = {}}) => {
  const body = serializer(fetchOpts.body);
  const url = `${HOSTNAME}/${path}`;

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${githubApiToken}`,
    ...(fetchOpts.method === 'POST'
      ? {'Content-Type': 'application/json'}
      : {}
    ),
    ...fetchOpts.headers
  };

  return request(url, {
    headers,
    body,
    ...R.omit(['headers', 'body'], fetchOpts)
  })
    .map(deserializer)
    .mapErr(({context, constructor}) => mapError({url, context})(constructor));
};