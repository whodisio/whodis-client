import axios from 'axios';

import {
  findWhodisBadRequestErrorInAxiosError,
  isAxiosError,
} from './WhodisBadRequestError';
import { findWhodisProxyNotSetupErrorInAxiosError } from './WhodisProxyNotSetupError';
import { assertTokenLooksUsableForTargetEnv } from './environment/assertTokenLooksUsableForTargetEnv';
import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';

export const answerAuthChallenge = async ({
  challengeUuid,
  challengeAnswer,
}: {
  challengeUuid: string;
  challengeAnswer: string;
}): Promise<{
  /**
   * returns `null` if the challenge was a `PROVE` challenge
   */
  token: string | null;
}> => {
  const target = detectTargetEnvironment();
  const hostname = await getDomainOfApiForEnv({ target });
  try {
    const { data } = await axios.post(
      `https://${hostname}/user/challenge/answer`,
      { challengeUuid, challengeAnswer, target },
      { withCredentials: true }, // with credentials to support receiving cookies; required for web env
    );
    const { token } = data;
    if (token) await assertTokenLooksUsableForTargetEnv({ target, token });
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
