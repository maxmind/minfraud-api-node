/**
 * Converts snake_case to camelCase
 * @param {string} input - snake_case string
 * @returns {string} - camelCase string
 */
export function snakeToCamelCase(input: string): string {
  return input.replace(/_+(\w?)/g, (_, p, o) =>
    o === 0 ? p : p.toUpperCase()
  );
}

const isObject = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof RegExp) &&
  !(value instanceof Error) &&
  !(value instanceof Date);

const processArray = (arr: Array<unknown>): unknown[] =>
  arr.map((el) =>
    Array.isArray(el)
      ? processArray(el)
      : isObject(el)
        ? camelcaseKeys(el as Record<string, unknown>)
        : el
  );

/**
 * Recursively converts the keys of a plain object — and of the plain objects
 * nested within it or within arrays — from snake_case to camelCase, returning a
 * new value. Arrays are mapped element-wise. Primitives and non-plain objects
 * (`null`, `undefined`, `Date`, `Error`, `RegExp`, etc.) are returned unchanged.
 *
 * @param input - a value that may contain snake_case keys
 * @returns the value with object keys converted to camelCase
 */
export function camelcaseKeys(input: unknown): unknown {
  if (Array.isArray(input)) {
    return processArray(input);
  }
  // Leave primitives (and null/undefined) untouched, matching snakecaseKeys.
  if (!isObject(input)) {
    return input;
  }

  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      output[snakeToCamelCase(key)] = processArray(value);
    } else if (isObject(value)) {
      output[snakeToCamelCase(key)] = camelcaseKeys(
        value as Record<string, unknown>
      );
    } else {
      output[snakeToCamelCase(key)] = value;
    }
  }

  return output;
}

/**
 * Convert camelCase keys to snake_case
 */
export function snakecaseKeys(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(snakecaseKeys);
  }

  if (!isObject(input)) {
    return input;
  }

  return Object.entries(input as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeKey] = snakecaseKeys(value);
      return acc;
    },
    {} as Record<string, unknown>
  );
}
