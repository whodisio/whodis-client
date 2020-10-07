import { isTokenRefreshable } from './isTokenRefreshable';

describe('isTokenRefreshable', () => {
  it('should return false if the tokens ttl has passed', () => {
    const exampleToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInR0bCI6MTUxNjIzOTAyMn0.sGGRmrWKC5A05Zs_qoYyMwI3jPg0RQ6q5f7r_bP-eCo`;
    const refreshable = isTokenRefreshable({ token: exampleToken });
    expect(refreshable).toEqual(false);
  });
  it('should return true if the tokens ttl has not passed, even if exp has', () => {
    const exampleToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInR0bCI6MjUxNjIzOTAyMn0.7s4OyZwMG9Q1V1FBB1AApiJvlF4O3PLK-2xUw2_xweU`;
    const refreshable = isTokenRefreshable({ token: exampleToken });
    expect(refreshable).toEqual(true);
  });
});
