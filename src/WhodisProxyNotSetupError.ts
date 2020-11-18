import { AxiosError } from 'axios';

export class WhodisProxyNotSetupError extends Error {
  constructor({ hostname }: { hostname: string }) {
    super(`Could not reach '${hostname}'. Was the proxy setup completed?`);
  }
}

export const findWhodisProxyNotSetupErrorInAxiosError = ({
  hostname,
  axiosError,
}: {
  hostname: string;
  axiosError: AxiosError;
}): WhodisProxyNotSetupError | null => {
  if (!axiosError.isAxiosError) return null; // if its not an error that originated from axios, then it can't be due to failure reaching proxy
  if (axiosError.message !== 'Network Error') return null; // if its not "could not contact server", then its not due to proxy not being setup
  if (hostname === 'api.whodis.io') return null; // if the request was to whodis.io directly, then proxy wasn't involved

  // if all of the above pass, then its likely due to proxy not being setup (... or user is not connected to internet, but there's no way to distinguish that)
  return new WhodisProxyNotSetupError({ hostname });
};
