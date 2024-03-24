export { IAlgoliaSearchQuery, TMultipleSearchStrategy } from './types/Search';
export { IAlgoliaSearchResult, IBatchedAlgoliaSearchResult } from './types/Result';
export { IAlgoliaConfig, IAlgoliaApi, IAlgoliaRequest, AlgoliaApi } from './AlgoliaApi';
export { AlgoliaSuggestionAPI, IIndexWithQueryParams } from './AlgoliaSuggestionAPI';
export {
  AlgoliaSearchAPI,
  IAlgoliaSearchConfig,
  IPagedCollectionWithCursor
} from './AlgoliaSearchAPI';
export { IAlgoliaFacet, IAlgoliaFacetValue, INumericRange } from './types/Facet';
export {
  facetFiltersToFilters,
  makeFilterString,
  makeFilterWithNumericRange
} from './utils/utils';
export { AlgoliaBrowseAPI } from './AlgoliaBrowseAPI';
export {
  AlgoliaInsightsAPI,
  IAlgoliaInsightsAPI,
  IAlgoliaTrackingEvent,
  IAlgoliaTrackingResult
} from './AlgoliaInsightsAPI';
export {
  AlgoliaBufferedApi,
  IAlgoliaQueryBufferConfiguration
} from './AlgoliaBufferedApi';
export { AlgoliaSearchSdk, IAlgoliaSearchSdkConfig } from './AlgoliaSearchSdk';
