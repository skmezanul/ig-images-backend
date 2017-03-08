import { S3 } from 'aws-sdk';
import { promisify } from 'bluebird';
import uuidV4 from 'uuid/v4';

const contentTypes = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpg',
};

export default async (event) => {
  const query = event.queryStringParameters;

  // complain if no query string
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Need query parameters',
      }),
    };
  }

  const contentType = contentTypes[query.type];

  // complain if missing 'type' query param
  if (!contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Need 'type' query param set to one of: ${Object.keys(contentTypes)}`,
      }),
    };
  }

  // build a presigned upload URL
  const extension = query.type;
  const s3Params = {
    Bucket: process.env.IMAGE_BUCKET,
    Key: `${process.env.OBJECT_PREFIX}${uuidV4()}.${extension}`,
    Expires: 600,
    ContentType: contentType,
    ACL: 'public-read',
  };

  const s3 = new S3();
  const getSignedUrl = promisify(s3.getSignedUrl, { context: s3 });

  const url = await getSignedUrl('putObject', s3Params);

  return {
    statusCode: 200,
    body: JSON.stringify({
      url,
    }),
  };
};
