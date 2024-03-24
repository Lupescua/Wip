/**
 * This utility type allows for typing the keys for jest's describe blocks.
 * Usefull to keep describe keys up to date.
 * @public
 */
export type JestTypedDescribe<TObj, TName extends string> = {
  (name: keyof TObj | TName, fn: jest.EmptyFunction): void;
} & { [K in keyof jest.Describe]: jest.Describe[K] };
