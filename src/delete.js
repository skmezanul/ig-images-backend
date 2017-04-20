// @flow

import { S3 } from 'aws-sdk';
import { promisify } from 'bluebird';
import { authenticate } from './lib/s3o';
import type { LambdaCall } from './types';

const { IMAGE_BUCKET, OBJECT_PREFIX } = process.env;
if (typeof IMAGE_BUCKET !== 'string' || typeof OBJECT_PREFIX !== 'string') {
  throw new Error('Env vars required: IMAGE_BUCKET, OBJECT_PREFIX');
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true, // TODO check if this is needed
};

const deleteImage = async (event: LambdaCall) => {
  const authenticated = await authenticate(event.queryStringParameters);

  if (authenticated !== true) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: 'Invalid credentials',
      }),
    };
  }

  const query = event.queryStringParameters;

  // complain if no query string
  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Need query parameters',
      }),
    };
  }

  const s3Params = {
    Bucket: IMAGE_BUCKET,
    Key: `${OBJECT_PREFIX}${query.name}`,
    Expires: 600, // the signed upload link lasts up to 10 minutes
  };

  const s3 = new S3();
  const getSignedUrl = promisify(s3.getSignedUrl, { context: s3 });

  const url = await getSignedUrl('deleteObject', s3Params);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      url,
    }),
  };
};

export default deleteImage;
