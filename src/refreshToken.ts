import axios from 'axios';

import { isTokenRefreshable } from './isTokenRefreshable';
import { findWhodisBadRequestErrorInAxiosError, WhodisBadRequestError } from './WhodisBadRequestError';
import { detectTargetEnvironment } from './environment/detectTargetEnvironment';

export const refreshToken = async ({ token }: { token: string }): Promise<{ token: string }> => {
  // check that the token is not already ttled out and not refreshable
  if (!isTokenRefreshable({ token })) throw new WhodisBadRequestError('token is not refreshable');

  // determine target environment
  const target = detectTargetEnvironment();

  // if token is still refreshable, try and refresh it
  try {
    const { data } = await axios.post('https://api.whodis.io/user/token/refresh', { target }, { headers: { authorization: token } });
    return { token: data.token };
  } catch (error) {
    const whodisBadRequestError = findWhodisBadRequestErrorInAxiosError({ axiosError: error });
    if (whodisBadRequestError) throw whodisBadRequestError; // if we found its a whodisBadRequestError, throw it
    throw error; // otherwise, just pass the error up as is - there's nothing helpful we can add onto it
  }
};
