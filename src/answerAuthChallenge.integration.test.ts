import { v4 as uuid } from 'uuid';

import { WhodisBadRequestError } from './WhodisBadRequestError';
import { answerAuthChallenge } from './answerAuthChallenge';

describe('answerAuthChallenge', () => {
  it('should be able to hit the answer auth challenge api', async () => {
    try {
      await answerAuthChallenge({
        challengeUuid: uuid(),
        challengeAnswer: '12345',
      });
      throw new Error('should not reach here');
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error).toBeInstanceOf(WhodisBadRequestError);
      expect(error.message).toContain('challenge does not exist');
    }
  });
});
