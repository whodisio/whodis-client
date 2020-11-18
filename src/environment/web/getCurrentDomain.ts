import { getDomainFromUri } from './getDomainFromUri';

/**
 * gets the domain of the current website this is running in (excluding subdomains, considering public domains)
 *
 * note: the big utility here is it abstracts away the web specific `window.location` knowledge - and makes it easy to mock for testing
 */
export const getCurrentDomain = () => getDomainFromUri(window.location.href);
