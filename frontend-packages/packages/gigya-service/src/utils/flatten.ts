export function flatten<TObject>(
  obj: object | undefined,
  stopWhenObjectIncludes: keyof TObject,
  roots: object[] = [],
  seperator: string = '.'
): Record<string, TObject> | undefined {
  if (!obj) return undefined;

  const keys = Object.keys(obj);
  return keys.reduce((memo, prop) => {
    const p = prop as keyof object;
    const isObject = typeof obj[p] === 'object';
    const includesStopKey = Object.keys(obj[p]).includes(
      stopWhenObjectIncludes as string
    );

    return {
      ...memo,
      ...(isObject && !includesStopKey
        ? // keep flattening if value is an object and does not contain search key
          flatten(obj[p], stopWhenObjectIncludes, roots.concat([p]), seperator)
        : // include current prop and value and prefix prop with the roots
          {
            [roots.concat([p]).join(seperator)]: obj[p]
          })
    };
  }, {});
}
