// @flow

import _list from './list';
import _getUploadUrl from './getUploadUrl';
import type { LambdaCall, Response } from './types';

type AsyncLambda = (
  event: LambdaCall,
  context: ?Object,
) => Promise<Response>;

const wrap = (fn: AsyncLambda) => (
  event: LambdaCall,
  context: ?Object,
  callback: (
    error: Error | null,
    response?: Response,
  ) => void,
): Response => {
  try {
    Promise.resolve(fn(event, context)).then(
      (response: Response) => {
        callback(null, response);
      },
      (error: Error) => { callback(error); },
    );
  } catch (error) {
    // serverless seems to have a bug where sync errors are missed sometimes
    callback(error);
  }
};

export const list = wrap(_list);
export const getUploadUrl = wrap(_getUploadUrl);
