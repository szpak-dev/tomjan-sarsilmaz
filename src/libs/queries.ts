/**
 * Query parser for accessing nested object/array properties using dot notation and array selectors
 * 
 * Syntax:
 * - "property" - access object property
 * - "property[0]" - access first array item
 * - "property[{id=value}]" - find array item where property "id" equals "value"
 * - "a.b[0].c[{id=test}].value" - chain multiple levels
 * 
 * @example
 * queryValue(obj, "attribute_groups[{id=dimensions}].properties[{id=length-of-blade}].value")
 */

/**
 * Parse array selector like "[0]" or "[{id=dimensions}]"
 */
function parseArraySelector(
  selector: string
): { type: "index"; value: number } | { type: "match"; prop: string; value: string } | null {
  const indexMatch = selector.match(/^\[(\d+)\]$/);
  if (indexMatch) {
    return { type: "index", value: parseInt(indexMatch[1], 10) };
  }

  const matchMatch = selector.match(/^\[\{\s*(\w+)\s*=\s*([^}]+)\s*\}\]$/);
  if (matchMatch) {
    return { type: "match", prop: matchMatch[1], value: matchMatch[2] };
  }

  return null;
}

/**
 * Split query by dots while respecting array selectors
 * @example "a.b[0].c[{id=test}].value" => ["a", "b[0]", "c[{id=test}]", "value"]
 */
function splitQuery(query: string): string[] {
  const parts: string[] = [];
  let current = "";
  let bracketDepth = 0;

  for (const char of query) {
    if (char === "[") {
      bracketDepth++;
      current += char;
    } else if (char === "]") {
      bracketDepth--;
      current += char;
    } else if (char === "." && bracketDepth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (current) parts.push(current);
  return parts;
}

/**
 * Get a value from an object using a query string with support for:
 * - Dot notation for object properties
 * - Array index access [0]
 * - Array object matching [{ prop=value }]
 */
export function queryValue(obj: any, query: string): any {
  const parts = splitQuery(query);
  let current = obj;

  for (const part of parts) {
    if (!current) return undefined;

    // Check if part contains array selector
    const arrayMatch = part.match(/^(.+?)(\[.+\])$/);

    if (arrayMatch) {
      const [, propName, selector] = arrayMatch;
      
      // First, access the property
      if (propName) {
        current = current[propName];
      }

      if (!Array.isArray(current)) {
        return undefined;
      }

      // Then apply array selector
      const parsed = parseArraySelector(selector);
      if (!parsed) return undefined;

      if (parsed.type === "index") {
        current = current[parsed.value];
      } else if (parsed.type === "match") {
        current = current.find((item) => item[parsed.prop] === parsed.value);
      }
    } else {
      // Regular property access
      current = current[part];
    }
  }

  return current;
}
