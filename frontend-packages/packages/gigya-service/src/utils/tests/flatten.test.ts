import { IPreference } from '@salling-group/gigya-api';
import { flatten } from '../flatten';

describe('flatten', () => {
  it('returns undefined if object is undefined', () => {
    const result = flatten(undefined, '');
    expect(result).toBeUndefined();
  });
  it('returns correct flattened object', () => {
    const input = {
      terms: {
        profile: {
          isConsentGranted: true,
          docVersion: 2.0,
          lastConsentModified: '2021-02-05T07:17:14.041Z',
          tags: [],
          customData: [],
          entitlements: []
        },
        dk: {
          foetex: {
            hd: {
              isConsentGranted: true,
              docVersion: 1.0,
              lastConsentModified: '2021-02-05T07:17:14.041Z',
              tags: [],
              customData: [],
              entitlements: []
            }
          }
        }
      }
    };

    const result = flatten<IPreference>(input, 'isConsentGranted');

    expect(result).toEqual({
      'terms.profile': {
        isConsentGranted: true,
        docVersion: 2,
        lastConsentModified: '2021-02-05T07:17:14.041Z',
        tags: [],
        customData: [],
        entitlements: []
      },
      'terms.dk.foetex.hd': {
        isConsentGranted: true,
        docVersion: 1,
        lastConsentModified: '2021-02-05T07:17:14.041Z',
        tags: [],
        customData: [],
        entitlements: []
      }
    });
  });
});
