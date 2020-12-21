import axios, { AxiosError } from 'axios';
import { createCache } from 'simple-in-memory-cache';
import { withSimpleCaching } from 'with-simple-caching';

export class ReservedDomainError extends Error {
  constructor({ hostname }: { hostname: string }) {
    super(`could not get domain from reserved hostname '${hostname}'.`);
  }
}

const isAxiosError = (error: Error): error is AxiosError => (error as any).isAxiosError;

/**
 * get the domain from a uri, excluding subdomain
 *
 * with caching, since these responses dont really change over time
 */
const getDomainFromHostname = withSimpleCaching(
  async (hostname: string): Promise<string> => {
    try {
      // if not, call whodis api to get the domain (note: we call the api because we dont want client to have to load the full public-suffix-list, which clocks in over 240kb: https://stackoverflow.com/a/23945027/3068233)
      const response = await axios.post(`https://api.whodis.io/client/domain/extract`, { hostname }); // TODO: update this to a "get" method for cloudfront caching
      const { domain } = response.data;
      return domain;
    } catch (error) {
      // if we can extract more details about this error, do so - to help the developer
      if (isAxiosError(error) && error.response!.data.errorMessage.includes(`type 'RESERVED'`)) {
        throw new ReservedDomainError({ hostname });
      }

      // otherwise, pass up the original error
      throw error;
    }
  },
  {
    cache: createCache(),
  },
);

/**
 * get the domain from a uri, excluding subdomain
 */
export const getDomainFromUri = async (uri: string): Promise<string> => {
  const hostname = uri.includes('/') ? new URL(uri).hostname : uri; // if uri does not contain a slash, then really its got to be a hostname already (note: we check because `new URL()` throws an error on hostnames)
  return getDomainFromHostname(hostname);
};
