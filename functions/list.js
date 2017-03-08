'use strict';

const AWS = require('aws-sdk');

module.exports = (event, context, callback) => {
  // return callback(null, {
  //   body: JSON.stringify({env: process.env, abc: 123, event})
  // });

  const params = {
    Bucket: process.env.IMAGE_BUCKET,
    Prefix: process.env.OBJECT_PREFIX,
  };

  // return callback(null, {abc: 123});
  try {
  const s3 = new AWS.S3();
  s3.listObjects(params, (error, data) => {
    if (error) {
      callback(error);
      return;
    }

    callback(null, {
      body: JSON.stringify({
        prefix: `http://${process.env.IMAGE_BUCKET}.s3-website-eu-west-1.amazonaws.com/${process.env.OBJECT_PREFIX}`,
        images: data.Contents
          .filter(item => item.Size > 0)
          .map(item => item.Key.substring(3))
      }),
    });
  });
  } catch (error) {

    callback(null, {
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      })
    });
  }
};
