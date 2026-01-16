/**
 * Pure dictionary building functions - NO I/O operations
 * All file operations are handled in content.dictionaries.ts
 */

export type Dictionary = Record<string, string>;
export type DescriptionsDictionary = Record<string, string[]>;
export type AttributeValuesDictionary = Record<string, Record<string, string>>;

export interface Product {
  id: string;
  description: string[];
  category_slug: string;
  category_name: string;
  attribute_groups: Array<{
    id: string;
    name: string;
    properties: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  }>;
  variants: Array<{
    id: string;
    name: string;
    value: string;
  }>;
}

/**
 * Sort object keys alphabetically (ascending)
 */
export function sortKeys<T extends Record<string, any>>(obj: T): T {
  const sorted = Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      const value = obj[key];
      // If value is an object (but not an array), sort its keys too
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        (result as any)[key] = sortKeys(value);
      } else {
        (result as any)[key] = value;
      }
      return result;
    }, {} as T);
  return sorted;
}

/**
 * Build attribute groups dictionary from products
 * Uses id as key and name as value
 */
export function buildAttributeGroupsDictionary(
  products: Product[],
  existingDictionary: Dictionary = {}
): Dictionary {
  const dictionary: Dictionary = { ...existingDictionary };

  for (const product of products) {
    for (const group of product.attribute_groups || []) {
      if (group.id && group.name && !dictionary[group.id]) {
        dictionary[group.id] = group.name;
      }
    }
  }

  return dictionary;
}

/**
 * Build attributes dictionary from products
 * Uses id as key and name as value
 */
export function buildAttributesDictionary(
  products: Product[],
  existingDictionary: Dictionary = {}
): Dictionary {
  const dictionary: Dictionary = { ...existingDictionary };

  for (const product of products) {
    for (const group of product.attribute_groups || []) {
      for (const property of group.properties || []) {
        if (property.id && property.name && !dictionary[property.id]) {
          dictionary[property.id] = property.name;
        }
      }
    }
  }

  return dictionary;
}

/**
 * Build variants dictionary from products
 * Uses id as key and name as value
 */
export function buildVariantsDictionary(
  products: Product[],
  existingDictionary: Dictionary = {}
): Dictionary {
  const dictionary: Dictionary = { ...existingDictionary };

  for (const product of products) {
    for (const variant of product.variants || []) {
      if (variant.id && variant.name && !dictionary[variant.id]) {
        dictionary[variant.id] = variant.name;
      }
    }
  }

  return dictionary;
}

/**
 * Build descriptions dictionary from products
 * Uses product id as key and description array as value
 */
export function buildDescriptionsDictionary(
  products: Product[],
  existingDictionary: DescriptionsDictionary = {}
): DescriptionsDictionary {
  const dictionary: DescriptionsDictionary = { ...existingDictionary };

  for (const product of products) {
    if (product.id && product.description && !dictionary[product.id]) {
      dictionary[product.id] = product.description;
    }
  }

  return dictionary;
}

/**
 * Build categories dictionary from categories
 * Uses category id as key and category name as value
 */
export function buildCategoriesDictionary(
  categories: Array<{ id: string; name: string }>,
  existingDictionary: Dictionary = {}
): Dictionary {
  const dictionary: Dictionary = { ...existingDictionary };

  for (const category of categories) {
    if (category.id && category.name && !dictionary[category.id]) {
      dictionary[category.id] = category.name;
    }
  }

  return dictionary;
}

/**
 * Build attribute values dictionary from products
 * Maps product ID to their attribute ID/value pairs
 */
export function buildAttributeValuesDictionary(
  products: Product[],
  existingDictionary: AttributeValuesDictionary = {}
): AttributeValuesDictionary {
  const dictionary: AttributeValuesDictionary = { ...existingDictionary };

  for (const product of products) {
    if (product.id && !dictionary[product.id]) {
      const attributeValues: Record<string, string> = {};

      for (const group of product.attribute_groups || []) {
        for (const property of group.properties || []) {
          if (property.id && property.value) {
            attributeValues[property.id] = property.value;
          }
        }
      }

      if (Object.keys(attributeValues).length > 0) {
        dictionary[product.id] = attributeValues;
      }
    }
  }

  return dictionary;
}

/**
 * Synchronize dictionaries: add missing keys from source to target
 */
export function synchronizeDictionaries<T extends Record<string, any>>(
  sourceDict: T,
  targetDict: T
): { updated: T; addedCount: number } {
  let addedCount = 0;
  const updated = { ...targetDict };

  for (const key in sourceDict) {
    if (!updated[key]) {
      updated[key] = sourceDict[key];
      addedCount++;
    }
  }

  return { updated, addedCount };
}
