import axios from 'axios';
import { OidcIdentityProvider } from 'simple-oidc-auth';
import { PickOne } from 'type-fns';

import {
  findWhodisBadRequestErrorInAxiosError,
  isAxiosError,
} from './WhodisBadRequestError';
import { findWhodisProxyNotSetupErrorInAxiosError } from './WhodisProxyNotSetupError';
import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';

export enum ChallengeGoal {
  /**
   * create new user
   */
  SIGNUP = 'SIGNUP',

  /**
   * access an existing user
   */
  LOGIN = 'LOGIN',

  /**
   * signup or login a user
   */
  SIGNIN = 'SIGNIN',

  /**
   * add a new credentials to a user
   */
  ADD = 'ADD',

  /**
   * prove control of credentials without assigning to user
   */
  PROVE = 'PROVE',
}

export enum ChallengeType {
  /**
   * a confirmation code sent to a contact method
   */
  CONFIRMATION_CODE = 'CONFIRMATION_CODE',

  /**
   * an openid-connect code exchanged with the directories oidc-client-secret
   *
   * ref:
   * - https://datatracker.ietf.org/doc/html/rfc6819#section-3.4
   */
  OIDC_AUTHCODE = 'OIDC_AUTHCODE',
}
export enum ContactMethodType {
  'PHONE' = 'PHONE',
  'EMAIL' = 'EMAIL',
}
export interface ContactMethod {
  type: ContactMethodType;
  address: string;
}

/**
 * details specific to a confirmation code challenge
 */
export interface ChallengeTypeConfirmationCodeDetails {
  /**
   * the contact method that the confirmation code is sent to
   */
  contactMethod: ContactMethod;
}

/**
 * details specific to a oidc authcode challenge
 */
export interface ChallengeTypeOidcAuthcodeDetails {
  /**
   * the identity provider which is authorizing the request
   */
  provider: OidcIdentityProvider;

  /**
   * the redirect uri to which we asked the identity provider to deliver the oidc authcode
   *
   * note
   * - this is used when exchanging the authcode
   */
  redirectUri: string;

  /**
   * the destination uri to which we were asked to redirect the user after the identity-provider responds
   *
   * note
   * - this is used to redirect the user to their final destination
   */
  destinationUri: {
    /**
     * the destination to redirect the user to when authorization is successful
     */
    onSuccess: string;

    /**
     * the destination to redirect the user to when authorization is not successful
     */
    onError: string;
  };
}

/**
 * details specific to a supported challenge type
 */
export type ChallengeTypeDetails =
  | ChallengeTypeConfirmationCodeDetails
  | ChallengeTypeOidcAuthcodeDetails;

// TODO: stop using "function" when typescript supports type overloading for arrow functions
export async function askAuthChallenge(input: {
  directoryUuid: string;
  clientUuid: string;
  goal: ChallengeGoal;
  type: ChallengeType.CONFIRMATION_CODE;
  details: ChallengeTypeConfirmationCodeDetails;
  override?: { hostname?: string };
}): Promise<{ challengeUuid: string; challengeCode: null }>;
export async function askAuthChallenge(input: {
  directoryUuid: string;
  clientUuid: string;
  goal: ChallengeGoal;
  type: ChallengeType.OIDC_AUTHCODE;
  details: ChallengeTypeOidcAuthcodeDetails;
}): Promise<{ challengeHash: string; challengeCode: string }>;

/**
 * ask to be granted an auth challenge
 *
 * note
 * - uses type overloads to narrow to the correct details and output for each challenge type
 */
export async function askAuthChallenge({
  directoryUuid,
  clientUuid,
  goal,
  type,
  details,
  override,
}: {
  directoryUuid: string;
  clientUuid: string;
  goal: ChallengeGoal;
  type: ChallengeType;
  details: ChallengeTypeDetails;
  override?: {
    hostname?: string;
  };
}): Promise<
  PickOne<{
    challengeUuid: string;
    challengeHash: string;
  }> & {
    challengeCode?: string | null;
  }
> {
  const target = detectTargetEnvironment();
  const hostname =
    override?.hostname ?? (await getDomainOfApiForEnv({ target })); // allow the user to override the hostname, if they know what they're doing
  try {
    const { data } = await axios.post(
      `https://${hostname}/user/challenge/ask`,
      { directoryUuid, clientUuid, goal, type, details },
      { withCredentials: true }, // with credentials to support receiving cookies; required for web env oidc
    );
    if (data.challengeHash)
      return {
        challengeHash: data.challengeHash,
        challengeCode: data.challengeCode ?? null,
      };
    return {
      challengeUuid: data.challengeUuid,
      challengeCode: data.challengeCode ?? null,
    };
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
}
