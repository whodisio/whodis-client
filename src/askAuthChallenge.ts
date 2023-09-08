import axios from 'axios';

import {
  findWhodisBadRequestErrorInAxiosError,
  isAxiosError,
} from './WhodisBadRequestError';
import { findWhodisProxyNotSetupErrorInAxiosError } from './WhodisProxyNotSetupError';
import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';

export enum ChallengeGoal {
  /**
   * create new user with a new contact-method
   */
  SIGNUP = 'SIGNUP',

  /**
   * access an existing user with an existing contact-method
   */
  LOGIN = 'LOGIN',

  /**
   * add a new contact-method to an existing, authenticated user
   */
  ADD = 'ADD',

  /**
   * prove control of a contact-method, without associating to a user
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
 * the identity provider which authenticates the user and issues the tokens via oidc flows
 */
export enum OidcIdentityProvider {
  /**
   * ref
   * - https://developers.google.com/identity/openid-connect/openid-connect
   */
  GOOGLE = 'GOOGLE',

  /**
   * ref
   * - https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms
   */
  APPLE = 'APPLE',

  /**
   * ref
   * - https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
   */
  FACEBOOK = 'FACEBOOK',
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

export const askAuthChallenge = async ({
  directoryUuid,
  clientUuid,
  goal,
  type,
  details,
}: {
  directoryUuid: string;
  clientUuid: string;
  goal: ChallengeGoal;
  type: ChallengeType;
  details: ChallengeTypeDetails;
}): Promise<{ challengeUuid: string }> => {
  const target = detectTargetEnvironment();
  const hostname = await getDomainOfApiForEnv({ target });
  try {
    const { data } = await axios.post(
      `https://${hostname}/user/challenge/ask`,
      { directoryUuid, clientUuid, goal, type, details },
    );
    return { challengeUuid: data.challengeUuid };
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
