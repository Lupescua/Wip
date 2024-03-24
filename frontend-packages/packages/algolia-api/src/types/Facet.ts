/**
 * @public
 */
export interface IAlgoliaFacet {
  id: string;
  name: string;
  selected: boolean;
  values: IAlgoliaFacetValue[];
  numericRange?: INumericRange;
}

/**
 * @public
 */
export interface INumericRange {
  max: number;
  min: number;
  selected: boolean;
  setMax?: number;
  setMin?: number;
  filterString: (min: number, max: number) => string;
}

/**
 * @public
 */
export interface IAlgoliaFacetValue {
  id: string;
  name: string;
  filterString: string;
  count: number;
  selected: boolean;
}
