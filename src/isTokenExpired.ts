import fromUnixTime from 'date-fns/fromUnixTime';
import isAfter from 'date-fns/isAfter';
import { getUnauthedClaims } from 'simple-jwt-auth';

import { WhodisAuthTokenClaims } from './WhodisAuthTokenClaims';

export const isTokenExpired = ({ token }: { token: string }) => {
  const claims = getUnauthedClaims<WhodisAuthTokenClaims>({ token });
  const now = new Date();
  const expHasPassed = isAfter(now, fromUnixTime(claims.exp));
  if (expHasPassed) return true;
  return false;
};
