import { IAlgoliaFacet } from '../types/Facet';
import {
  encode,
  facetFiltersToFilters,
  removeFacetFromFilterString,
  serializeQueryParameters,
  makeFilterWithNumericRange
} from './utils';

describe('encode', () => {
  it('escapes and replaces %s correctly', () => {
    const encodedString = encode('abc%sdef%s', 'å', ' ');
    expect(encodedString).toBe('abc%C3%A5def%20');
  });
});

describe('serializeQueryParameters', () => {
  it('serializes correctly', () => {
    const parameters = {
      query: 'Øko Havregryn',
      facets: ['abc', 'def'],
      filters: {
        objectID: '12345'
      }
    };

    const serializedParameters = serializeQueryParameters(parameters);

    expect(serializedParameters).toBe(
      'query=%C3%98ko%20Havregryn&facets=%5B%22abc%22%2C%22def%22%5D&filters=%7B%22objectID%22%3A%2212345%22%7D'
    );
  });
});

describe('facetFiltersToFilters', () => {
  it('transforms the facet filters correctly', () => {
    const filters = facetFiltersToFilters([
      'universe:DC',
      ['author:Stephen King', 'genre:Horror'],
      'publisher:Penguin'
    ]);

    expect(filters).toBe(
      '("universe":"DC") AND ("author":"Stephen King" OR "genre":"Horror") AND ("publisher":"Penguin")'
    );
  });
});

describe('removeFacetFromFilterString', () => {
  // [['filter string', 'facet to remove'], 'expected filter string']
  const tests: [[string, string], string][] = [
    [['', 'brand'], ''],
    [['brand:Salling', 'brand'], ''],
    [['label:Salling', 'brand'], 'label:Salling'],
    [['brand:Salling OR brand:Arla', 'brand'], ''],
    // Partial match on facet name should not be included
    [
      ["f_brand:'Elizabeth Arden' AND is_exposed:true", 'brand'],
      "f_brand:'Elizabeth Arden' AND is_exposed:true"
    ],
    // Facet value in single quotes
    [["f_brand:'Elizabeth Arden' AND is_exposed:true", 'f_brand'], 'is_exposed:true'],
    [['("extension.GreenScore":"3")', '"extension.GreenScore"'], ''],
    // Logical operators on both sides of removed facet
    [
      ['label:Frost AND (brand:Salling OR brand:Arla) AND (size:XL OR size:L)', 'brand'],
      'label:Frost AND (size:XL OR size:L)'
    ],
    // Trailing cleanup
    [
      ['(label:Frost) AND (brand:Salling OR brand:Arla) AND brand:Nestle', 'brand'],
      '(label:Frost)'
    ],
    // Trailing cleanup
    [
      ['(label:Frost) AND brand:Nestle AND (brand:Salling OR brand:Arla)', 'brand'],
      '(label:Frost)'
    ],
    // Facet name and value with and without quotes
    [
      [
        `(brand:Princip OR "brand":"Salling FRI" OR "brand":"Ella's Kitchen") AND ("attributes.attributeName":"Økomærket EU" OR "attributes.attributeName":"Andre økologimærker" OR "attributes.attributeName":"Anbefalet af Dyrenes Beskyttelse")`,
        'brand'
      ],
      `("attributes.attributeName":"Økomærket EU" OR "attributes.attributeName":"Andre økologimærker" OR "attributes.attributeName":"Anbefalet af Dyrenes Beskyttelse")`
    ],
    // Numeric filters
    [
      ['(price:20 TO 10) AND brand:Nestle AND (brand:Salling OR brand:Arla)', 'price'],
      'brand:Nestle AND (brand:Salling OR brand:Arla)'
    ],
    [['(price:20 TO 10 OR price < 100) AND brand:Nestle', 'price'], 'brand:Nestle'],
    [['price >= 20 AND price <= 100', 'price'], ''],
    [['(price:0 TO 10.3) AND brand:Nestle', 'price'], 'brand:Nestle']
  ];

  test.each(tests)(
    'removeFacetFromFilterString(...%j) should produce filter string %j',
    (input, expected) => {
      expect(removeFacetFromFilterString(...input)).toEqual(expected);
    }
  );
});

describe('makeFilterWithNumericRange', () => {
  // [['min', 'max', 'facetsWithStringFilters', 'facetName'], 'expected filter string']
  const tests: [[number, number, IAlgoliaFacet[], string], string][] = [
    //add to the existing selected filters
    [
      [
        1,
        10,
        [
          {
            id: 'id',
            name: 'price',
            selected: true,
            values: [
              {
                id: 'id',
                name: 'price',
                filterString: '(label:Frost) AND brand:Nestle AND (price:1)',
                selected: true,
                count: 1
              }
            ]
          }
        ],
        'price'
      ],
      '(label:Frost) AND brand:Nestle AND (price:1 TO 10)'
    ],
    //Exclude the AND operator if there is non selected filters
    [
      [
        200,
        250,
        [
          {
            id: 'id',
            name: 'price',
            selected: true,
            values: [
              { id: 'id', name: 'price', filterString: '', selected: true, count: 1 }
            ]
          }
        ],
        'price'
      ],
      '(price:200 TO 250)'
    ],
    //Modify the existing range filter with the new values
    [
      [
        10,
        20,
        [
          {
            id: 'id',
            name: 'price',
            selected: true,
            values: [
              {
                id: 'id',
                name: 'price',
                filterString: '(label:Frost) AND (price:200 TO 250)',
                selected: true,
                count: 1
              }
            ]
          }
        ],
        'price'
      ],
      '(label:Frost) AND (price:10 TO 20)'
    ]
  ];

  test.each(tests)(
    'makeFilterWithNumericRange(...%j) should produce filter string %j',
    (input, expected) => {
      expect(makeFilterWithNumericRange(...input)).toEqual(expected);
    }
  );
});
