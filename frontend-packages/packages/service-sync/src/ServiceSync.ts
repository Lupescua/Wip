import { Service } from '@salling-group/core-service';
import { ITokenSource } from '@salling-group/request-handlers';
import { from } from 'rxjs';

/**
 * @public
 */
export class ServiceSync {
  /**
   * @public
   * Keeps a service state synchronize with a token.
   * @param service - Service for synchronization.
   * @param token - Token for synchronization.
   * @param stateToSync - function to specify what of state should synchronized. If Omitted the whole state is synchronized.
   */
  public static sync<TService extends Service<TState>, TState>(
    service: TService,
    token: ITokenSource<string>,
    stateToSync?: (state: TState) => Partial<TState>
  ): TService {
    // Subscribe to token.get() and sync service state
    from(token.get()).subscribe((tokenState) => {
      if (this._hasStateChanged(service.getValue(), tokenState, stateToSync)) {
        const state: Partial<TState> = JSON.parse(tokenState);
        Service.setState(service, state);
      }
    });

    // Subscribe to service state and sync token.
    Service.getState(service).subscribe((currentState) => {
      const partialState = this._getServiceSyncState(currentState, stateToSync);
      const tokenState = JSON.stringify(partialState);

      token.set(tokenState);
    });

    return service;
  }

  private static _hasStateChanged<TState>(
    serviceState: TState,
    tokenState: string,
    convertFunction?: (state: TState) => Partial<TState>
  ): boolean {
    const partialState = this._getServiceSyncState(serviceState, convertFunction);
    return !!tokenState && !!partialState && JSON.stringify(partialState) !== tokenState;
  }

  private static _getServiceSyncState<TState>(
    state: TState,
    convertFunction?: (state: TState) => Partial<TState>
  ): Partial<TState> {
    return (convertFunction && convertFunction(state)) || state;
  }
}
