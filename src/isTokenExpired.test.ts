import { isTokenExpired } from './isTokenExpired';

describe('isTokenExpired', () => {
  it('should return true if the tokens exp has passed', () => {
    const exampleToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInR0bCI6MTUxNjIzOTAyMn0.sGGRmrWKC5A05Zs_qoYyMwI3jPg0RQ6q5f7r_bP-eCo`;
    const expired = isTokenExpired({ token: exampleToken });
    expect(expired).toEqual(true);
  });
  it('should return false if the tokens exp has not passed', () => {
    const exampleToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjIsInR0bCI6MjUxNjIzOTAyMn0.Vk95x0_kEP3Azngwn_aZApwyZeZmOKNYkLTXveEeJgg`;
    const expired = isTokenExpired({ token: exampleToken });
    expect(expired).toEqual(false);
  });
});
