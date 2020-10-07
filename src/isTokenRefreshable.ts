import { fromUnixTime, isAfter } from 'date-fns';
import { getUnauthedClaims } from 'simple-jwt-auth';

import { WhodisAuthTokenClaims } from './WhodisAuthTokenClaims';

export const isTokenRefreshable = ({ token }: { token: string }) => {
  const claims = getUnauthedClaims<WhodisAuthTokenClaims>({ token });
  const now = new Date();
  const ttlHasPassed = isAfter(now, fromUnixTime(claims.ttl));
  if (ttlHasPassed) return false;
  return true;
};
