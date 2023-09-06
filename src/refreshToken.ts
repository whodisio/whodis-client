import axios from 'axios';

import {
  findWhodisBadRequestErrorInAxiosError,
  isAxiosError,
  WhodisBadRequestError,
} from './WhodisBadRequestError';
import { findWhodisProxyNotSetupErrorInAxiosError } from './WhodisProxyNotSetupError';
import { assertTokenLooksUsableForTargetEnv } from './environment/assertTokenLooksUsableForTargetEnv';
import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';
import { isTokenRefreshable } from './isTokenRefreshable';

export const refreshToken = async ({
  token: tokenToRefresh,
}: {
  token: string;
}): Promise<{ token: string }> => {
  // check that the token is not already ttled out and not refreshable
  if (!isTokenRefreshable({ token: tokenToRefresh }))
    throw new WhodisBadRequestError('token is not refreshable');

  // determine target environment
  const target = detectTargetEnvironment();
  const hostname = await getDomainOfApiForEnv({ target });

  // if token is still refreshable, try and refresh it
  try {
    const { data } = await axios.post(
      `https://${hostname}/user/token/refresh`,
      { target },
      {
        headers: { authorization: tokenToRefresh },
        withCredentials: true, // with credentials to support receiving cookies; required for web env
      },
    );
    const { token } = data;
    await assertTokenLooksUsableForTargetEnv({ target, token });
    return { token };
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (!isAxiosError(error)) throw error;

    // catch and hydrate whodis bad request errors, if found
    const whodisBadRequestError = findWhodisBadRequestErrorInAxiosError({
      axiosError: error,
    });
    if (whodisBadRequestError) throw whodisBadRequestError; // if we found its a whodisBadRequestError, throw it

    // treat errors related to web proxy not being setup, if found (i.e., proxy at hostname is not setup yet)
    const whodisProxyNotSetupError = findWhodisProxyNotSetupErrorInAxiosError({
      hostname,
      axiosError: error,
    });
    if (whodisProxyNotSetupError) throw whodisProxyNotSetupError;

    // otherwise, just pass the error up as is - there's nothing helpful we can do
    throw error;
  }
};
