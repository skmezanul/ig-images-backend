import { S3 } from 'aws-sdk';
import { promisify } from 'bluebird';

export default async () => {
  const params = {
    Bucket: process.env.IMAGE_BUCKET,
    Prefix: process.env.OBJECT_PREFIX,
  };

  const s3 = new S3();
  const listObjects = promisify(s3.listObjects, { context: s3 });

  const data = await listObjects(params);

  return {
    body: JSON.stringify({
      prefix: `http://${process.env.IMAGE_BUCKET}.s3-website-eu-west-1.amazonaws.com/${process.env.OBJECT_PREFIX}`,

      images: data.Contents
        .filter(item => item.Size > 0)
        .map(item => item.Key.substring(3)),
    }),
  };
};
