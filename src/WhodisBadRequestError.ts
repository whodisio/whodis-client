import { AxiosError } from 'axios';

export class WhodisBadRequestError extends Error {}

export const findWhodisBadRequestErrorInAxiosError = ({ axiosError }: { axiosError: AxiosError }): WhodisBadRequestError | null => {
  if (!axiosError.response) return null; // if no response, do nothing
  if (axiosError.response.data.errorType !== 'BadRequestError') return null; // if not a bad request error, do nothing
  return new WhodisBadRequestError(axiosError.response.data.errorMessage); // throw whodisBadRequestError if so
};
