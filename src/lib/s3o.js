// @flow

import crypto from 'crypto';
import RSA from 'node-rsa';
import axios from 'axios';

import type { ValidateOptions } from '../types';

export const validate = ({ publicKey, username, host, token }: ValidateOptions): boolean => {
  const key = `${username}-${host}`;

  // Convert the publicKey from DER format to PEM format
  // See: https://www.npmjs.com/package/node-rsa
  const buffer = new Buffer(publicKey, 'base64');
  const derKey = new RSA(buffer, 'pkcs8-public-der');
  const publicPem = derKey.exportKey('pkcs8-public-pem');

  // See: https://nodejs.org/api/crypto.html
  const verifier = crypto.createVerify('sha1');
  verifier.update(key);
  return verifier.verify(publicPem, token, 'base64');
};

export const getPublicKey = async (): Promise<string> => {
  const response = await axios.get('https://s3o.ft.com/publickey', { responseType: 'text' });

  return response.data;
};

type AuthenticateParams = {
  username: string,
  host: string,
  token: string,
};

// main high-level API
export const authenticate = async (params: ?AuthenticateParams): Promise<boolean> => {
  if (!params) return false;

  const publicKey = await getPublicKey();

  const { host, username, token } = params;

  return validate({ publicKey, host, username, token });
};
