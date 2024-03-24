import { IPreference } from '@salling-group/gigya-api';

export function validateUserConsents(
  requiredConsents?: Record<string, boolean | number>,
  userConsents?: Record<string, IPreference>
): boolean | undefined {
  // No req set, user is always valid
  if (!requiredConsents) return true;
  // If user consents are not loaded we can't be sure user is valid and will return undefined
  if (!userConsents) return undefined;
  // Else iterate the required consents and validate all are existing for the user
  return Object.entries(requiredConsents).every(([key, value]) => {
    if (value === false) return true;
    return (
      userConsents[key] &&
      userConsents[key].isConsentGranted &&
      (value === true || userConsents[key].docVersion >= value)
    );
  });
}
