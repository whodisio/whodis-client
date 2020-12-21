import { TargetEnvironment } from './detectTargetEnvironment';
import { getCurrentDomain } from './web/getCurrentDomain';
import { ReservedDomainError } from './web/getDomainFromUri';

/**
 * web environment has special considerations, because it uses cookies as storage mechanism
 *
 * if targeting native, always `api.whodis.io`
 * if targeting web, then always `auth.${websiteDomain}` (i.e., a subdomain of current site) (seamlessly supported by whodis domain proxies)
 */
export const getDomainOfApiForEnv = async ({ target }: { target: TargetEnvironment }) => {
  // native is always the normal api address
  if (target === TargetEnvironment.NATIVE) return 'api.whodis.io';

  // web must use a proxy to the api, from a subdomain of the current site, in order for browser to save the auth cookie from the api
  if (target === TargetEnvironment.WEB) {
    try {
      const domain = await getCurrentDomain();
      return `auth.${domain}`; // whodis provisions all domain proxies as `whodis.${domain}`
    } catch (error) {
      if (error instanceof ReservedDomainError) {
        // if the error is due to this being a "reserved domain", we can suggest a solution to the user
        throw new Error(
          `
Websites served from domains such as 'localhost' can not be used for authentication, as the browser will not set the authentication cookie due to the domains not being same site.

To resolve this, you can edit your local computer's DNS to route 'localhost.yourdomain.com' to localhost (for example: https://superuser.com/a/147667/425694). This works because the website now is hosted from a subdomain of the domain 'yourdomain.com', which is "same-site" from the browsers perspective.
          `.trim(),
        );
      }
    }
  }

  // if none of the above, we dont support it yet
  throw new Error('unexpected target env'); // fail fast
};
