import {
  findWhodisBadRequestErrorInAxiosError,
  WhodisAuthGoalError,
  WhodisBadRequestError,
} from './WhodisBadRequestError';

describe('WhodisBadRequestError', () => {
  it('can detect a bad request error and returns an instance of WhodisBadRequestError class', () => {
    const badRequestError = findWhodisBadRequestErrorInAxiosError({
      axiosError: {
        response: {
          data: {
            errorType: 'BadRequestError',
            errorMessage: 'got the request, but it was invalid',
          },
        },
      } as any,
    });
    expect(badRequestError).toBeInstanceOf(WhodisBadRequestError);
    expect(badRequestError?.message).toEqual(
      'got the request, but it was invalid',
    );
  });
  describe('WhodisAuthGoalError', () => {
    it('can detect the more specific variant of WhodisAuthGoalError in the login case', () => {
      const badRequestError = findWhodisBadRequestErrorInAxiosError({
        axiosError: {
          response: {
            data: {
              errorType: 'BadRequestError',
              errorMessage:
                'user does not exist in directory for contact method, cant login',
            },
          },
        } as any,
      });
      expect(badRequestError).toBeInstanceOf(WhodisAuthGoalError);
      expect(badRequestError).toBeInstanceOf(WhodisBadRequestError); // and still an instance of the base error
      expect(badRequestError?.message).toEqual(
        'user does not exist in directory for contact method, cant login',
      );
    });
    it('can detect the more specific variant of WhodisAuthGoalError in the signup case', () => {
      const badRequestError = findWhodisBadRequestErrorInAxiosError({
        axiosError: {
          response: {
            data: {
              errorType: 'BadRequestError',
              errorMessage:
                'user already exists in directory for contact method, cant signup',
            },
          },
        } as any,
      });
      expect(badRequestError).toBeInstanceOf(WhodisAuthGoalError);
      expect(badRequestError).toBeInstanceOf(WhodisBadRequestError); // and still an instance of the base error
      expect(badRequestError?.message).toEqual(
        'user already exists in directory for contact method, cant signup',
      );
    });
  });
});
