import { fromUnixTime, isAfter } from 'date-fns';
import { getUnauthedClaims } from 'simple-jwt-auth';

import { WhodisAuthTokenClaims } from './WhodisAuthTokenClaims';

export const isTokenExpired = ({ token }: { token: string }) => {
  const claims = getUnauthedClaims<WhodisAuthTokenClaims>({ token });
  const now = new Date();
  const expHasPassed = isAfter(now, fromUnixTime(claims.exp));
  if (expHasPassed) return true;
  return false;
};
