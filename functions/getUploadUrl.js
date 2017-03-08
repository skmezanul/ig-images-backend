'use strict';

const AWS = require('aws-sdk');
const uuidV4 = require('uuid/v4');

const contentTypes = {
  'svg': 'image/svg+xml',
  'png': 'image/png',
  'jpg': 'image/jpg',
};

module.exports = (event, context, callback) => {
  const query = event.queryStringParameters;

  // complain if no query string
  if (!query) {
    // bad request
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        'error': 'Need query parameters',
      }),
    });
  }

  const contentType = contentTypes[query.type];

  // complain if missing 'type' query param
  if (!contentType) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        'error': `Need 'type' query param set to one of: ${Object.keys(contentTypes)}`,
      }),
    });

    return;
  }

  // build a presigned upload URL
  const extension = query.type;
  const s3Params = {
    Bucket: process.env.IMAGE_BUCKET,
    Key: `${process.env.OBJECT_PREFIX}${uuidV4()}.${extension}`,
    Expires: 600,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const s3 = new AWS.S3();

  s3.getSignedUrl('putObject', s3Params, (error, url) => {
    if (error) {
      callback(error);
      return;
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        url,
        // event,
      }),
    });
  });
};
