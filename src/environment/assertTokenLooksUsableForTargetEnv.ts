import { redactSignature, getUnauthedClaims } from 'simple-jwt-auth';

import { TargetEnvironment } from './detectTargetEnvironment';
import { getCurrentDomain } from './web/getCurrentDomain';
import { getDomainFromUri } from './web/getDomainFromUri';

export class UnusableTokenDetectedError extends Error {
  constructor({
    reason,
    target,
  }: {
    reason: string;
    target: TargetEnvironment;
  }) {
    const message = `Unusable token detected, for target env '${target}'. ${reason}`;
    super(message);
  }
}

/**
 * this function just implements a few "fail-fast" checks that only developers will experience while building their apps
 *
 * the purpose is to fail fast at common mistakes that can be detected quickly - and inform folks on how to fix them
 *
 * what we check for:
 *  - for native:
 *    - it should be a non-signature-redacted token
 *  - for web:
 *    - it must be a signature-redacted token (since we need the anti-csrf-token)
 *    - the audience of the token must have the same domain as the current domain of the website (since otherwise it can't be sent to audience)
 *
 * TODO: reference a wiki for each error that documents the solution
 */
export const assertTokenLooksUsableForTargetEnv = async ({
  token,
  target,
}: {
  token: string;
  target: TargetEnvironment;
}) => {
  // for native env
  if (target === TargetEnvironment.NATIVE) {
    // if its a signature redacted token, its not usable
    if (token === redactSignature({ token }))
      throw new UnusableTokenDetectedError({
        reason:
          'Token has a redacted signature, which means it cant be used for authentication',
        target,
      });
  }

  // for web env
  if (target === TargetEnvironment.WEB) {
    // if the token is not signature redacted, then its vulnerable to XSS
    if (token !== redactSignature({ token }))
      throw new UnusableTokenDetectedError({
        reason:
          'Token does not have a redacted signature, which is a XSS vulnerability',
        target,
      });
    // if the audience of the token is not the same site as this website, it will fail CSRF checks
    const tokenAudDomain = await getDomainFromUri(
      getUnauthedClaims({ token }).aud,
    );
    const currentDomain = await getCurrentDomain();
    if (tokenAudDomain !== currentDomain)
      throw new UnusableTokenDetectedError({
        reason: `Domain of jwt audience !== current domain, which means it cant be used for authentication by this site, due to CSRF checks ('${tokenAudDomain}' !== '${currentDomain}')`,
        target,
      });
  }
};
