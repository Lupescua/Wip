import { getGigyaErrorCode, GigyaErrorCode, isGigyaError } from '../errors';

describe('isGigyaError', () => {
  it('returns true if object has shape of a gigya error', () => {
    const obj = { response: { errorCode: 403042 } };

    const result = isGigyaError(obj);

    expect(result).toBe(true);
  });

  it('returns false if object does not have shape of a gigya error', () => {
    const obj = { response: { status: 404 } };

    const result = isGigyaError(obj);

    expect(result).toBe(false);
  });
});

describe('getGigyaError', () => {
  it('returns correct mapped enum', () => {
    const obj = { response: { errorCode: 403042 } };

    const result = getGigyaErrorCode(obj);

    expect(result).toBe(GigyaErrorCode.INVALID_LOGIN_ID);
  });
});
