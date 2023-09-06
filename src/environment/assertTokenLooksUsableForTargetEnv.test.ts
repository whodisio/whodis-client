import { redactSignature } from 'simple-jwt-auth';

import {
  assertTokenLooksUsableForTargetEnv,
  UnusableTokenDetectedError,
} from './assertTokenLooksUsableForTargetEnv';
import { TargetEnvironment } from './detectTargetEnvironment';
import { getCurrentDomain } from './web/getCurrentDomain';

jest.mock('./web/getCurrentDomain');
const getCurrentDomainMock = getCurrentDomain as jest.Mock;

const exampleToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYXVkIjoiYXBpLmFoYm9kZS5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMiwidHRsIjoxNTE2MjM5MDIyfQ.1ji5dKtLYEK6Gtbep4yN8yaDGk5hkneLvxw1MHf21V8`;
const exampleSignatureRedactedToken = redactSignature({ token: exampleToken });

describe('assertTokenLooksUsableForTargetEnv', () => {
  describe('target native', () => {
    it('does nothing for a usable token', async () => {
      await assertTokenLooksUsableForTargetEnv({
        target: TargetEnvironment.NATIVE,
        token: exampleToken,
      });
    });
    it('throws an error if the token is signature redacted', async () => {
      try {
        await assertTokenLooksUsableForTargetEnv({
          target: TargetEnvironment.NATIVE,
          token: exampleSignatureRedactedToken,
        });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        expect(error).toBeInstanceOf(UnusableTokenDetectedError);
        expect(error.message).toContain(
          'Token has a redacted signature, which means it cant be used for authentication',
        );
      }
    });
  });
  describe('target web', () => {
    it('does nothing for a usable token', async () => {
      getCurrentDomainMock.mockReturnValueOnce('ahbode.com');
      await assertTokenLooksUsableForTargetEnv({
        target: TargetEnvironment.WEB,
        token: exampleSignatureRedactedToken,
      });
    });
    it('throws an error if the token is not signature redacted', async () => {
      try {
        await assertTokenLooksUsableForTargetEnv({
          target: TargetEnvironment.WEB,
          token: exampleToken,
        });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        expect(error).toBeInstanceOf(UnusableTokenDetectedError);
        expect(error.message).toContain(
          'Token does not have a redacted signature, which is a XSS vulnerability',
        );
      }
    });
    it('throws an error if the domain of jwt audience !== current domain', async () => {
      try {
        getCurrentDomainMock.mockReturnValueOnce('localhost');
        await assertTokenLooksUsableForTargetEnv({
          target: TargetEnvironment.WEB,
          token: exampleSignatureRedactedToken,
        });
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        expect(error).toBeInstanceOf(UnusableTokenDetectedError);
        expect(error.message).toContain(
          'Domain of jwt audience !== current domain, which means it cant be used for authentication by this site',
        );
      }
    });
  });
});
