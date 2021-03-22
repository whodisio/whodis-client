/* eslint-disable max-classes-per-file */
import { AxiosError } from 'axios';

/**
 * an error from Whodis which specifies that it received your request successfully, but decided that it was invalid
 */
export class WhodisBadRequestError extends Error {}
export const isWhodisBadRequestError = (error: Error): error is WhodisBadRequestError => error instanceof WhodisBadRequestError;

/**
 * an error thrown when the auth goal is not valid for the inputs provided
 *
 * for example:
 * - if a user for this contactMethod does not exist, they must signup before they can login
 * - if a user for this contactMethod already exists, they need to login instead of signup
 *
 * useful because this error is user input driven. a good user experiences will handle this error gracefully
 */
export class WhodisAuthGoalError extends WhodisBadRequestError {}
export const isWhodisAuthGoalError = (error: Error): error is WhodisAuthGoalError => error instanceof WhodisAuthGoalError;
const hasWhodisAuthGoalErrorMessage = (error: WhodisBadRequestError): boolean => {
  const messagesToLookFor = [
    'user does not exist in directory for contact method, cant login',
    'user already exists in directory for contact method, cant signup',
  ];
  return messagesToLookFor.some((message) => error.message.includes(message));
};

/**
 * extracts a WhodisBadRequestError, or a more specific instance of the WhodisBadRequestError, from an axios error - if possible
 */
export const findWhodisBadRequestErrorInAxiosError = ({ axiosError }: { axiosError: AxiosError }): WhodisBadRequestError | null => {
  // extract the error, if possible
  if (!axiosError.response) return null; // if no response, do nothing
  if (axiosError.response.data.errorType !== 'BadRequestError') return null; // if not a bad request error, do nothing
  const badRequestError = new WhodisBadRequestError(axiosError.response.data.errorMessage); // throw whodisBadRequestError if so

  // check if this is a well known type of error; if so, return that more specific instance of BadRequestError instead
  if (hasWhodisAuthGoalErrorMessage(badRequestError)) return new WhodisAuthGoalError(badRequestError.message);

  // if no more specific instance available, then just return the generic badRequestError itself
  return badRequestError;
};
