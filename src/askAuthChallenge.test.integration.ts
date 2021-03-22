import dotenv from 'dotenv';
import uuid from 'uuid';

import { askAuthChallenge, ChallengeGoal, ChallengeType, ContactMethodType } from './askAuthChallenge';
import { WhodisBadRequestError, WhodisAuthGoalError } from './WhodisBadRequestError';

dotenv.config();

describe('askAuthChallenge', () => {
  it('should be able to hit the ask auth challenge api', async () => {
    try {
      await askAuthChallenge({
        directoryUuid: uuid(), // random uuid -> api will respond with bad request
        clientUuid: uuid(), // random string -> api will respond with bad request
        goal: ChallengeGoal.LOGIN,
        type: ChallengeType.CONFIRMATION_CODE,
        contactMethod: {
          type: ContactMethodType.PHONE,
          address: '+15555555555',
        },
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(WhodisBadRequestError);
      expect(error.message).toContain('clientUuid does not provide access to this directory');
    }
  });
  it('should throw a WhodisAuthGoalError when a non-user attempts to login', async () => {
    // grab directory credentials and real contact method to send from env variables; they're not sensitive, but doesn't feel right to hardcode :shrug:
    const directoryUuid = process.env.ASK_AUTH_CHALLENGE_EXAMPLE_DIRECTORY_UUID!;
    expect(typeof directoryUuid).toEqual('string'); // sanity check
    const clientUuid = process.env.ASK_AUTH_CHALLENGE_EXAMPLE_CLIENT_TOKEN!;
    expect(typeof clientUuid).toEqual('string'); // sanity check

    // ask the challenge
    try {
      await askAuthChallenge({
        directoryUuid,
        clientUuid,
        goal: ChallengeGoal.LOGIN,
        type: ChallengeType.CONFIRMATION_CODE,
        contactMethod: {
          type: ContactMethodType.EMAIL,
          address: `${uuid()}@gmail.com`,
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(WhodisAuthGoalError);
      expect(error.message).toContain('user does not exist in directory for contact method, cant login');
    }
  });
  it('should be able to get a real auth challenge successfully', async () => {
    // grab directory credentials and real contact method to send from env variables; they're not sensitive, but doesn't feel right to hardcode :shrug:
    const directoryUuid = process.env.ASK_AUTH_CHALLENGE_EXAMPLE_DIRECTORY_UUID!;
    expect(typeof directoryUuid).toEqual('string'); // sanity check
    const clientUuid = process.env.ASK_AUTH_CHALLENGE_EXAMPLE_CLIENT_TOKEN!;
    expect(typeof clientUuid).toEqual('string'); // sanity check
    const emailAddress = process.env.ASK_AUTH_CHALLENGE_EXAMPLE_EMAIL!;
    expect(typeof emailAddress).toEqual('string'); // sanity check

    // ask the challenge
    const { challengeUuid } = await askAuthChallenge({
      directoryUuid,
      clientUuid,
      goal: ChallengeGoal.SIGNUP,
      type: ChallengeType.CONFIRMATION_CODE,
      contactMethod: {
        type: ContactMethodType.EMAIL,
        address: emailAddress,
      },
    });

    // expect challengeUuid to be defined
    expect(challengeUuid.length).toEqual(36); // sanity check uuid length
  });
});
