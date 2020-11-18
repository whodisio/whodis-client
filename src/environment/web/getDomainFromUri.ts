import { fromUrl, parseDomain, ParseResultType } from 'parse-domain';

export class ReservedDomainError extends Error {
  constructor({ uri }: { uri: string }) {
    super(`could not get hostname from reserved uri '${uri}'`);
  }
}

/**
 * get the domain from a uri, excluding subdomain
 */
export const getDomainFromUri = (uri: string): string => {
  const domains = parseDomain(fromUrl(uri));
  if (domains.type === ParseResultType.Reserved) throw new ReservedDomainError({ uri }); // special case, since we can give users a better error message in some contexts
  if (domains.type !== ParseResultType.Listed) throw new Error(`could not get hostname from uri '${uri}'`); // should not happen, but fail fast if does
  const hostname = [domains.domain, ...domains.topLevelDomains].join('.');
  return hostname;
};
