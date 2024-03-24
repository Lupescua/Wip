import { IPagedCollection } from '@salling-group/core';
import { Observable } from 'rxjs';
import { expand, map, mergeMap, pluck, takeWhile } from 'rxjs/operators';
import { IPagedCollectionWithCursor } from '.';
import { AlgoliaSearchAPI } from './AlgoliaSearchAPI';
import { IAlgoliaFacet } from './types/Facet';
import { IAlgoliaSearchQuery } from './types/Search';

/**
 * @public
 */
export class AlgoliaBrowseAPI<
  TDocumentId,
  TDocumentFull,
  TDocumentPartial,
  TSorting extends string | number
> extends AlgoliaSearchAPI<TDocumentId, TDocumentFull, TDocumentPartial, TSorting> {
  public getAllPaths(
    mapFn: (document: TDocumentPartial) => string,
    hitsPerPage: number = 100,
    filters?: string
  ): Observable<string> {
    const browse = (
      cursor?: string
    ): Observable<
      IPagedCollectionWithCursor<TDocumentPartial, number, IAlgoliaFacet, TSorting>
    > => {
      return this.searchAlgolia(this.config.defaultIndex, {
        cursor,
        hitsPerPage,
        attributesToRetrieve: this.config.partialDocumentFields,
        filters
      });
    };

    return browse().pipe(
      expand((result) => {
        const { cursor } = result;
        return browse(cursor);
      }),
      takeWhile((res) => res.cursor !== undefined, true),
      mergeMap((res) => res.documents.map((doc) => mapFn(doc)))
    );
  }

  protected searchAlgolia<TDocument>(
    index: string,
    searchObject: IAlgoliaSearchQuery
  ): Observable<IPagedCollection<TDocument, number, IAlgoliaFacet, TSorting>> {
    return this.algoliaAPI
      .browse<TDocument>({ indexName: index, params: searchObject })
      .pipe(pluck('data'), map(this.algoliaResultToPagedCollection));
  }
}
