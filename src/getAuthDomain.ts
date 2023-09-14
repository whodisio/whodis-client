import { detectTargetEnvironment } from './environment/detectTargetEnvironment';
import { getDomainOfApiForEnv } from './environment/getDomainOfApiForEnv';

/**
 * looks up the domain of the auth api in this environment
 *
 * note
 * - for browser environments, it will look up the proxy domain configured for your directory, required for secure storage capabilities
 * - for native environments, it will use the standard whodis api, since the device does provide secure storage capabilities
 */
export const getAuthDomain = async (): Promise<{ domain: string }> => {
  return {
    domain: await getDomainOfApiForEnv({ target: detectTargetEnvironment() }),
  };
};
