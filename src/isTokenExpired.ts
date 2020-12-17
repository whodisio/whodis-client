import { getUnauthedClaims } from 'simple-jwt-auth';

import { WhodisAuthTokenClaims } from './WhodisAuthTokenClaims';

// define basic date manipulation fns (dont import from a third party lib to decrease bundle size; this stuff is really basic too)
const fromUnixTime = (seconds: number) => new Date(seconds * 1000);
const isAfter = (referenceDate: Date, comparisonDate: Date) => referenceDate.getTime() > comparisonDate.getTime();

export const isTokenExpired = ({ token }: { token: string }) => {
  const claims = getUnauthedClaims<WhodisAuthTokenClaims>({ token });
  const now = new Date();
  const expHasPassed = isAfter(now, fromUnixTime(claims.exp));
  if (expHasPassed) return true;
  return false;
};
