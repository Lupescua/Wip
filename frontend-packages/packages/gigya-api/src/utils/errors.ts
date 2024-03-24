/**
 * @public
 */
export enum GigyaErrorCode {
  INVALID_LOGIN_ID = 403042,
  ACCOUNT_DISABLED = 403041,
  LOGIN_ID_DOESNT_EXIST = 403047,
  ACCOUNT_PENDING_REGISTRATION = 206001,
  INVALID_PARAMETER = 400006,
  PENDING_CODE_VERIFICATION = 206006,
  RESET_LINK_EXPIRED = 403025,
  PENDING_PASSWORD_CHANGE = 403100
}

/**
 * @public
 */
export interface IGigyaErrorResponse {
  response: { errorCode: GigyaErrorCode };
}

/**
 * @public
 */
export function isGigyaError(payload: unknown): payload is IGigyaErrorResponse {
  const gigyaError = payload as IGigyaErrorResponse;
  return gigyaError.response && gigyaError.response.errorCode !== undefined;
}

/**
 * @public
 */
export function getGigyaErrorCode(payload: IGigyaErrorResponse): GigyaErrorCode {
  return payload.response.errorCode;
}
