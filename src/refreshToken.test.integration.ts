import { refreshToken } from './refreshToken';
import { WhodisBadRequestError } from './WhodisBadRequestError';

describe('refreshToken', () => {
  it('should be able to hit the refresh token api', async () => {
    try {
      await refreshToken({
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInR0bCI6MjUxNjIzOTAyMn0.7s4OyZwMG9Q1V1FBB1AApiJvlF4O3PLK-2xUw2_xweU', // not a valid token
      });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(WhodisBadRequestError);
      expect(error.message).toContain('jwt.aud is invalid'); // since it doesn't have a real audience on that token
    }
  });
});
