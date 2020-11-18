import axios from 'axios';

import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';
import { findWhodisBadRequestErrorInAxiosError } from './WhodisBadRequestError';
import { findWhodisProxyNotSetupErrorInAxiosError } from './WhodisProxyNotSetupError';

export enum ChallengeGoal {
  'SIGNUP' = 'SIGNUP',
  'LOGIN' = 'LOGIN',
}
export enum ChallengeType {
  CONFIRMATION_CODE = 'CONFIRMATION_CODE',
}
export enum ContactMethodType {
  'PHONE' = 'PHONE',
  'EMAIL' = 'EMAIL',
}

export const askAuthChallenge = async ({
  directoryUuid,
  clientUuid,
  goal,
  type,
  contactMethod,
}: {
  directoryUuid: string;
  clientUuid: string;
  goal: ChallengeGoal;
  type: ChallengeType;
  contactMethod: {
    type: ContactMethodType;
    address: string;
  };
}): Promise<{ challengeUuid: string }> => {
  const target = detectTargetEnvironment();
  const hostname = getDomainOfApiForEnv({ target });
  try {
    const { data } = await axios.post(`https://${hostname}/user/challenge/ask`, { directoryUuid, clientUuid, goal, type, contactMethod });
    return { challengeUuid: data.challengeUuid };
  } catch (error) {
    // catch and hydrate whodis bad request errors, if found
    const whodisBadRequestError = findWhodisBadRequestErrorInAxiosError({ axiosError: error });
    if (whodisBadRequestError) throw whodisBadRequestError; // if we found its a whodisBadRequestError, throw it

    // treat errors related to web proxy not being setup, if found (i.e., proxy at hostname is not setup yet)
    const whodisProxyNotSetupError = findWhodisProxyNotSetupErrorInAxiosError({ hostname, axiosError: error });
    if (whodisProxyNotSetupError) throw whodisProxyNotSetupError;

    // otherwise, just pass the error up as is - there's nothing helpful we can do
    throw error;
  }
};
