// @flow

export type LambdaCall = Event & {
  queryStringParameters: { [string]: string }
};

export type Response = {
  statusCode: number,
  headers: { [string]: string },
  body: string,
};

export type AsyncLambda = (
  event: LambdaCall,
  context: ?Object,
) => Promise<Response>;

export type ValidateOptions = {
  publicKey: string,
  username: string,
  host: string,
  token: string,
};
