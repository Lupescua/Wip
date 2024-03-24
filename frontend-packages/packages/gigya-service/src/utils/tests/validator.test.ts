import { IPreference } from '@salling-group/gigya-api';
import { validateUserConsents } from '../validators';

describe('validateUserConsents', () => {
  const userConsents: Record<string, IPreference> = {
    'profiling.dk.foetex.hd': {
      isConsentGranted: false,
      docVersion: 1,
      lastConsentModified: new Date(),
      tags: [],
      customData: [],
      entitlements: ''
    },
    'terms.profile': {
      isConsentGranted: true,
      docVersion: 1,
      lastConsentModified: new Date(),
      tags: [],
      customData: [],
      entitlements: ''
    }
  };

  it('returns valid when no consensts are required', () => {
    const result = validateUserConsents(undefined, userConsents);
    expect(result).toBe(true);
  });

  it('returns undefined when no user consents are available but some are required', () => {
    const result = validateUserConsents({ some: true }, undefined);
    expect(result).toBe(undefined);
  });

  it('returns valid when user has required consent', () => {
    const result = validateUserConsents({ 'terms.profile': true }, userConsents);
    expect(result).toBe(true);
  });

  it('returns invalid when user does not have required consent', () => {
    const result = validateUserConsents({ 'profiling.dk.foetex.hd': true }, userConsents);
    expect(result).toBe(false);
  });

  it('returns valid when user has greater version of consent', () => {
    const result = validateUserConsents(
      { 'terms.profile': 1, 'im.ignored': false },
      userConsents
    );
    expect(result).toBe(true);
  });

  it('returns invalid when users consent is lower than required version', () => {
    const result = validateUserConsents({ 'terms.profile': 2 }, userConsents);
    expect(result).toBe(false);
  });
});
