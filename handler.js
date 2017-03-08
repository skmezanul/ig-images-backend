/* eslint-disable */

'use strict';

const wrap = fn => (event, context, callback) => {
  try {
    Promise.resolve(fn(event, context)).then(
      (response) => {
        // validate response is in the right format
        if (typeof response.body !== 'string') {
          throw new Error('Expected response body to be a string');
        }

        callback(null, response);
      },
      (error) => { callback(error); }
    );
  } catch (error) {
    // serverless seems to have a bug where sync errors aren't caught sometimes...
    callback(error);
  }
};

module.exports.list = wrap(require('./dist.service/list').default);
exports.getUploadUrl = wrap(require('./dist.service/getUploadUrl').default);
