import { Observable } from 'rxjs';

/**
 * @public
 */
export interface IIndex<TTypeEnum> {
  indexName: string;
  hitsPerPage: number;
  type: TTypeEnum;
}

/**
 * @public
 */
export interface ISuggestionAPI {
  getSuggestions<TSuggestion extends { type: TTypeEnum }, TTypeEnum>(
    term: string,
    indexes: Array<IIndex<TTypeEnum>>
  ): Observable<Array<TSuggestion>>;
}
