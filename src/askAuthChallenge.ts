import axios from 'axios';

import { findWhodisBadRequestErrorInAxiosError } from './WhodisBadRequestError';

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
  clientToken,
  goal,
  type,
  contactMethod,
}: {
  directoryUuid: string;
  clientToken: string;
  goal: ChallengeGoal;
  type: ChallengeType;
  contactMethod: {
    type: ContactMethodType;
    address: string;
  };
}): Promise<{ challengeUuid: string }> => {
  try {
    const { data } = await axios.post('https://api.whodis.io/user/challenge/ask', { directoryUuid, clientToken, goal, type, contactMethod });
    return { challengeUuid: data.challengeUuid };
  } catch (error) {
    const whodisBadRequestError = findWhodisBadRequestErrorInAxiosError({ axiosError: error });
    if (whodisBadRequestError) throw whodisBadRequestError; // if we found its a whodisBadRequestError, throw it
    throw error; // otherwise, just pass the error up as is - there's nothing helpful we can add onto it
  }
};
