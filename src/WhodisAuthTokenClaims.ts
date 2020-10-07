export interface WhodisAuthTokenClaims {
  /**
   * the issuer of the token, identified by a path to an https server where authentication-server-metadata can be found (e.g., for OAuth2 and OIDC "discovery" flows)
   */
  iss: string;

  /**
   * who the subject of the token is (i.e., the userUuid who we created the token for)
   */
  sub: string;

  /**
   * who the audience of the token is (i.e., the directoryUuid which this token was created to be used by)
   */
  aud: string;

  /**
   * when this token was issued
   */
  iat: number;

  /**
   * when can this token start being used
   */
  nbf: number;

  /**
   * when this token expires - and should no longer be trusted for authentication
   */
  exp: number;

  /**
   * when this token's lifespan has expired - and can not even be used for refreshing
   */
  ttl: number;
}
