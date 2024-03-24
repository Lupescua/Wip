/* eslint-disable @rushstack/security/no-unsafe-regexp */
import { IAlgoliaFacet } from '../types/Facet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encode(format: string, ...args: readonly any[]): string {
  let i = 0;

  return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
}

export function serializeQueryParameters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Readonly<Record<string, any>>
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isObjectOrArray = (value: any): boolean =>
    Object.prototype.toString.call(value) === '[object Object]' ||
    Object.prototype.toString.call(value) === '[object Array]';

  return Object.keys(parameters)
    .map((key) =>
      encode(
        '%s=%s',
        key,
        isObjectOrArray(parameters[key])
          ? JSON.stringify(parameters[key])
          : parameters[key]
      )
    )
    .join('&');
}

function escapeFilter(filter?: string): string {
  const [first, last] = (filter && filter.split(':')) ?? ['', ''];
  if (!first || !last) return '';
  return `"${first}":"${last}"`;
}

/** Converts an array to a filter string
 */

export function arrayToFilter<TValue>(
  values: TValue[],
  separator: 'OR' | 'AND',
  prefix?: string
): string {
  return values.map((id) => (prefix ? `${prefix}:${id}` : id)).join(` ${separator} `);
}

/** Converts an facetFilters array to a filters string
 *
 * {@link https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/in-depth/filters-and-facetfilters/#syntax-difference-between-filters-and-facetfilters}
 * @public
 */
export function facetFiltersToFilters(facetFilters: (string | string[])[]): string {
  return facetFilters
    .map((filter) =>
      Array.isArray(filter)
        ? filter.filter(Boolean).map(escapeFilter).join(' OR ')
        : escapeFilter(filter as string)
    )
    .filter(Boolean)
    .map((v) => `(${v})`)
    .join(' AND ');
}

/**
 * Modify selcted facet values and return a complete filter string
 * @public
 */
export function makeFilterString(
  facets: IAlgoliaFacet[],
  modifyValues: Record<string, boolean>
): string {
  // Update modified facet values
  const modifiedFacets = facets.map((f) => {
    return {
      ...f,
      values: f.values.map((v) => {
        const selected = modifyValues[v.id];
        if (selected !== undefined) return { ...v, selected };
        return v;
      })
    };
  });

  // Join facets into algolia filter string
  return modifiedFacets
    .filter(
      (f) =>
        f.values.some((v) => v.selected) || (f.numericRange && f.numericRange.selected)
    )
    .map((f) => {
      if (
        f.numericRange &&
        f.numericRange.setMin &&
        f.numericRange.setMax &&
        f.numericRange.selected
      ) {
        return `"${f.name}":${f.numericRange.setMin} TO ${f.numericRange.setMax}`;
      }
      return f.values
        .filter((v) => v.selected)
        .map((v) => `"${f.name}":"${v.name}"`)
        .join(' OR ');
    })
    .map((v) => `(${v})`)
    .join(' AND ');
}

/**
 * Modify selcted facet with numeric range and return a complete filter string
 * @public
 */
export function makeFilterWithNumericRange(
  min: number,
  max: number,
  facets: IAlgoliaFacet[],
  facetName: string
): string {
  //We are interested in the possible selected filters in the rest of the facets which are inside the values of the facets arguments
  const filters = facets.reduce((acc: string, cur) => {
    if (cur.name === facetName && cur.values.length) {
      acc = removeFacetFromFilterString(cur.values[0].filterString, facetName);
    }

    return acc;
  }, '');

  const range = `(${facetName}:${min} TO ${max})`;

  const operator = filters ? ' AND ' : '';

  return `${filters}${operator}${range}`;
}

/** Removes all occurances of a given facet from a filterstring.
 * Also takes care of removing any logical operators tied to the removed facet */
export function removeFacetFromFilterString(
  filterString: string,
  facetName: string
): string {
  // Make sure the facet starts with a delimter to avoid partial matching names. Eg: brand matching f_brand
  const delimiter = `(?=\\(|\\b| |")`;
  // Note: includes any following " OR " or " AND " as those operators are directly tied to what we are removing
  const regQuotes = new RegExp(
    delimiter + facetName + `:("|')(.*?)\\1( OR | AND )*`,
    'g'
  );
  const regNumericRangeFilters = new RegExp(
    delimiter + facetName + `:(\\d+(\.\\d+)? TO \\d+(\.\\d+)?)( OR | AND )*`,
    'g'
  );
  const regNumericLimitFilters = new RegExp(
    delimiter + facetName + `( (<|>|=|<=|!=|>=) (\\d)+)( OR | AND )*`,
    'g'
  );
  const regWhitespace = new RegExp(
    delimiter + facetName + `:([^\\s)]+)( OR | AND )*`,
    'g'
  );

  const regCleanEmptyParentheses = new RegExp(/ *(OR |AND )\(\)/, 'g');
  const regCleanLeadingAndTrailing = new RegExp(
    /^ *(OR |AND |\(\) )+|( *(OR|AND|\(\)))+ *$/,
    'g'
  );

  // First remove all occurances where value is quoted (remove everything within quotes)
  const filtersWithoutQuoted = filterString.replace(regQuotes, '');

  // Remove numeric filters
  const filtersWithoutNumericRanges = filtersWithoutQuoted.replace(
    regNumericRangeFilters,
    ''
  );
  const filtersWithoutNumericLimit = filtersWithoutNumericRanges.replace(
    regNumericLimitFilters,
    ''
  );

  // Then remove all the non quoted (remove everything untill next whitespace)
  const filtersWithoutFacet = filtersWithoutNumericLimit.replace(regWhitespace, '');
  // Clean up by removing empty parentheses and any logical operators pointing to the empty parentheses
  const filtersWithoutFacetClean1 = filtersWithoutFacet.replace(
    regCleanEmptyParentheses,
    ''
  );
  const filtersWithoutFacetCleaned = filtersWithoutFacetClean1.replace(
    regCleanLeadingAndTrailing,
    ''
  );

  // There is a chance the same facet occours inside quotes in the filterstring, which should also removed
  if (!facetName.startsWith('"')) {
    return removeFacetFromFilterString(filtersWithoutFacetCleaned, `"${facetName}"`);
  }

  return filtersWithoutFacetCleaned;
}
