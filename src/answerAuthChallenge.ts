import axios from 'axios';

import { assertTokenLooksUsableForTargetEnv } from './environment/assertTokenLooksUsableForTargetEnv';
import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';
import { findWhodisBadRequestErrorInAxiosError } from './WhodisBadRequestError';

export const answerAuthChallenge = async ({
  challengeUuid,
  challengeAnswer,
}: {
  challengeUuid: string;
  challengeAnswer: string;
}): Promise<{ token: string }> => {
  const target = detectTargetEnvironment();
  const hostname = getDomainOfApiForEnv({ target });
  try {
    const { data } = await axios.post(
      `https://${hostname}/user/challenge/answer`,
      { challengeUuid, challengeAnswer, target },
      { withCredentials: true }, // with credentials to support receiving cookies; required for web env
    );
    const { token } = data;
    await assertTokenLooksUsableForTargetEnv({ target, token });
    return { token };
  } catch (error) {
    const whodisBadRequestError = findWhodisBadRequestErrorInAxiosError({ axiosError: error });
    if (whodisBadRequestError) throw whodisBadRequestError; // if we found its a whodisBadRequestError, throw it
    throw error; // otherwise, just pass the error up as is - there's nothing helpful we can add onto it
  }
};
