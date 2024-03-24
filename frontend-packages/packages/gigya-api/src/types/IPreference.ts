/**
 * @public
 */
export interface IPreference {
  isConsentGranted: boolean;
  docVersion: number;
  lastConsentModified: Date;
  tags: Array<string>;
  customData: Array<{ [key: string]: unknown }>;
  entitlements: string;
}
