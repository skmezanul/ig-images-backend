export type LambdaCall = Event & {
  queryStringParameters: { [string]: string }
};

export type Response = {
  statusCode: number,
  headers: { [string]: string },
  body: string,
};
