import { getDomainFromUri } from './getDomainFromUri';

describe('getHostnameFromUri', () => {
  it('should extract the hostname from a uri', () => {
    const hostname = getDomainFromUri('https://api.ahbode.com');
    expect(hostname).toEqual('ahbode.com');
  });
});
