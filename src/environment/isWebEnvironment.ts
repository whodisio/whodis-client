/**
 * determine whether this code is currently running in a web environment
 */
export const isWebEnvironment = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  if (typeof document !== 'undefined') return true; // if "document" is defined, then we're in web environment
  return false; // otherwise, we are not
};
