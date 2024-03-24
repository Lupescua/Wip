/**
 * @public
 */
export interface IAlgoliaSearchResult<THit> {
  hits: THit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  query: string;
  queryID?: string;
  cursor?: string;
  params: string;
  facets?: Record<string, Record<string, number>>;
  facets_stats?: Record<string, Record<string, number>>;
  index: string;
  userData?: Record<string, unknown>[];
  abTestID?: number;
  abTestVariantID?: number;
}

/**
 * @public
 */
export interface IBatchedAlgoliaSearchResult<THit> {
  results: IAlgoliaSearchResult<THit>[];
}
