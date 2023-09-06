import { getDomainFromUri, ReservedDomainError } from './getDomainFromUri';

describe('getDomainFromUri', () => {
  it('should extract the domain from a uri', async () => {
    const domain = await getDomainFromUri('https://www.ahbode.com');
    expect(domain).toEqual('ahbode.com');
  });
  it('should also be able to extract the domain from a hostname', async () => {
    const domain = await getDomainFromUri('api.ahbode.com');
    expect(domain).toEqual('ahbode.com');
  });
  it('should throw a ReservedDomainError if the domain couldnt be extracted for localhost', async () => {
    try {
      await getDomainFromUri('https://localhost:3443');
      throw new Error('should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(ReservedDomainError);
    }
  });
});
