// methods
export { askAuthChallenge } from './askAuthChallenge';
export { answerAuthChallenge } from './answerAuthChallenge';
export { isTokenRefreshable } from './isTokenRefreshable';
export { refreshToken } from './refreshToken';
export { isTokenExpired } from './isTokenExpired';
export { getAuthDomain } from './getAuthDomain';

// errors and types
export {
  WhodisBadRequestError,
  isWhodisBadRequestError,
  WhodisAuthGoalError,
  isWhodisAuthGoalError,
} from './WhodisBadRequestError';
export { WhodisProxyNotSetupError } from './WhodisProxyNotSetupError';
export { WhodisAuthTokenClaims } from './WhodisAuthTokenClaims';
export {
  ChallengeGoal,
  ChallengeType,
  ContactMethodType,
  ContactMethod,
  ChallengeTypeDetails,
  ChallengeTypeOidcAuthcodeDetails,
  ChallengeTypeConfirmationCodeDetails,
} from './askAuthChallenge';

// forward this enum for convenience
export { OidcIdentityProvider } from 'simple-oidc-auth';
