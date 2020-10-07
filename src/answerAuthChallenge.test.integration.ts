import uuid from 'uuid';

import { answerAuthChallenge } from './answerAuthChallenge';
import { WhodisBadRequestError } from './WhodisBadRequestError';

describe('answerAuthChallenge', () => {
  it('should be able to hit the answer auth challenge api', async () => {
    try {
      await answerAuthChallenge({
        challengeUuid: uuid(),
        challengeAnswer: '12345',
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(WhodisBadRequestError);
      expect(error.message).toContain('challenge does not exist');
    }
  });
});
