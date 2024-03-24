import { Service } from '@salling-group/core-service';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { TestScheduler } from 'rx-sandbox/dist/scheduler/TestScheduler';

/**
 * @public
 */
export type SearchSignature<TSuggestion> = (term: string) => Observable<TSuggestion[]>;

/**
 * @public
 */
export interface ISuggestionServiceState<TSuggestion> {
  suggestions: Array<TSuggestion>;
  term: string;
}

/**
 * @public
 */
export interface ISuggestionServiceConfig<TSuggestion> {
  getSuggestions: SearchSignature<TSuggestion>;
  searchDebounce?: number;
  scheduler?: TestScheduler;
}

/**
 * @public
 */
export interface ISuggestionService<TSuggestion>
  extends Service<ISuggestionServiceState<TSuggestion>> {
  readonly suggestions: Observable<Array<TSuggestion>>;
  readonly term: Observable<string>;
  setTerm(term: string): void;
}

/**
 * @public
 */
export class SuggestionService<TSuggestion>
  extends Service<ISuggestionServiceState<TSuggestion>>
  implements ISuggestionService<TSuggestion> {
  private _getSuggestions: SearchSignature<TSuggestion>;
  private _searchDebounce: number;
  private _scheduler?: TestScheduler;

  public constructor({
    getSuggestions,
    searchDebounce,
    scheduler
  }: ISuggestionServiceConfig<TSuggestion>) {
    super({ suggestions: [], term: '' });

    this._getSuggestions = getSuggestions;
    this._searchDebounce = searchDebounce || 150;
    this._scheduler = scheduler;

    this._listen();
  }

  public get suggestions(): Observable<Array<TSuggestion>> {
    return this.selector((state) => state.suggestions);
  }

  public get term(): Observable<string> {
    return this.selector((state) => state.term);
  }

  public setTerm(term: string): void {
    this.setState({ term });
  }

  private _search(term: string): Observable<ISuggestionServiceState<TSuggestion>> {
    return this.setState(() =>
      this._getSuggestions(term).pipe(
        catchError(() => of([])),
        map((suggestions) => ({ ...this.getValue(), suggestions }))
      )
    );
  }

  private _listen(): void {
    this.selector((state) => state.term)
      .pipe(
        filter<string>(Boolean),
        debounceTime(this._searchDebounce, this._scheduler), // Time in milliseconds between search requests
        switchMap((term) => this._search(term))
      )
      .subscribe();
  }
}
