// @flow

import _list from './list';
import _getUploadUrl from './getUploadUrl';

import type { LambdaCall, Response, AsyncLambda } from './types';

/**
 * Takes an async function and de-promisifies it so it can work with Lambda's
 * callback-based API.
 *
 * @param  {Function} fn A function that returns a promise of an HTTP response.
 */
const wrap = (fn: AsyncLambda) => (
  event: LambdaCall,
  context: ?Object,
  callback: (
    error: Error | null,
    response?: Response,
  ) => void,
): void => {
  try {
    Promise.resolve(fn(event, context)).then(
      (response: Response) => {
        callback(null, response);
      },
      (error: Error) => { callback(error); },
    );
  } catch (error) {
    // serverless seems to have a bug where sync errors are missed sometimes,
    // so we catch any error and manually call back with it
    callback(error);
  }
};

export const list = wrap(_list);
export const getUploadUrl = wrap(_getUploadUrl);
