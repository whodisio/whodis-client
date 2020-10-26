import { isWebEnvironment } from './isWebEnvironment';

export enum TargetEnvironment {
  /**
   * web applications and websites, which operate in a browser
   *
   * these environments do not have secure storage for client secrets, due to XSS vulnerability
   */
  WEB = 'WEB',

  /**
   * native applications, which operate on Android, iOS, Linux, Mac, etc
   *
   * these environments typically have secure storage for client secrets
   */
  NATIVE = 'NATIVE',
}

/**
 * detect if we should be targeting a native or a web environment
 */
export const detectTargetEnvironment = () => {
  if (isWebEnvironment()) return TargetEnvironment.WEB;
  return TargetEnvironment.NATIVE;
};
