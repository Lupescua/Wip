/**
 * @public
 */
export interface IPreferencesSchemaField {
  currentDocVersion?: number;
  legalStatements?: { [key: string]: IGigyaLegalStatement };
  required?: boolean;
}

/**
 * @public
 */
export interface IGigyaLegalStatement {
  documentStoreType: number;
  purpose: string;
}
