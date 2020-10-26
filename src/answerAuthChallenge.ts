import axios from 'axios';

import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { findWhodisBadRequestErrorInAxiosError } from './WhodisBadRequestError';

export const answerAuthChallenge = async ({
  challengeUuid,
  challengeAnswer,
}: {
  challengeUuid: string;
  challengeAnswer: string;
}): Promise<{ token: string }> => {
  const target = detectTargetEnvironment();
  try {
    const { data } = await axios.post('https://api.whodis.io/user/challenge/answer', { challengeUuid, challengeAnswer, target });
    return { token: data.token };
  } catch (error) {
    const whodisBadRequestError = findWhodisBadRequestErrorInAxiosError({ axiosError: error });
    if (whodisBadRequestError) throw whodisBadRequestError; // if we found its a whodisBadRequestError, throw it
    throw error; // otherwise, just pass the error up as is - there's nothing helpful we can add onto it
  }
};
