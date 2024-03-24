/* istanbul ignore file */
import { Observable, of, SchedulerLike, throwError } from 'rxjs';
import { AjaxRequest, AjaxResponse } from 'rxjs/ajax';
import { delay } from 'rxjs/operators';

export function createMockedAuthAPI(
  scheduler: SchedulerLike
): (AjaxRequest: AjaxRequest) => Observable<Partial<AjaxResponse>> {
  return ({ url, headers }) => {
    if (
      url ===
      'gigya/accounts.getAccountInfo?apiKey=apiKey&login_token=correctCode&include=id_token'
    )
      return of({ status: 200, response: { id_token: 'correctCode' } }).pipe(
        delay(1, scheduler)
      );

    // give access token when authenticating
    if (url === 'url?client_id=id&code=correctCode&grant_type=access')
      return of({
        status: 200,
        response: { access_token: 'correct', membershipNumber: '123' }
      }).pipe(delay(1, scheduler));

    if (
      !headers ||
      (headers as { Authorization: string }).Authorization !== 'Bearer correct'
    )
      return throwError({ status: 401, response: 'unauthenticated' }).pipe(
        delay(1, scheduler)
      );

    if (url && url.includes('fail'))
      return throwError({ status: 400, response: 'bad request' }).pipe(
        delay(1, scheduler)
      );

    return of({
      status: 200,
      response: `request to ${url}`,
      xhr: ({
        getAllResponseHeaders: jest.fn(() => 'header1: headerdata1')
      } as unknown) as XMLHttpRequest
    }).pipe(delay(1, scheduler));
  };
}

export function createMockedBearerAPI(
  scheduler: SchedulerLike
): (AjaxRequest: AjaxRequest) => Observable<Partial<AjaxResponse>> {
  return ({ url, headers }) => {
    if (url && url.includes('fail'))
      return throwError({ status: 400, response: 'bad request' }).pipe(
        delay(1, scheduler)
      );

    return of({
      status: 200,
      response: `request to ${url}`,
      xhr: ({
        getAllResponseHeaders: jest.fn(() => 'header1: headerdata1')
      } as unknown) as XMLHttpRequest
    }).pipe(delay(1, scheduler));
  };
}
