/**
 * @public
 */
export interface IAlgoliaSearchQuery {
  // Search
  query?: string;
  similarQuery?: string;
  // Attributes
  attributesToRetrieve?: string[];
  restrictSearchableAttributes?: string[];
  // Filtering
  filters?: string;
  facetFilters?: Array<Array<string>>;
  optionalFilters?: string[];
  numericFilters?: string[];
  tagFilters?: string[];
  // Faceting
  facets?: string[];
  sortFacetValuesBy?: 'count' | 'alpha';
  // Pagination
  page?: number;
  hitsPerPage?: number;
  cursor?: string;
  // Personalization
  enablePersonalization?: boolean;
  userToken?: string;
  // advanced
  distinct?: number | boolean;
  clickAnalytics?: boolean;
  analytics?: boolean;
  analyticsTags?: string[];
  getRankingInfo?: boolean;
}

/**
 * @public
 */
export type TMultipleSearchStrategy = 'none' | 'stopIfEnoughMatches';
