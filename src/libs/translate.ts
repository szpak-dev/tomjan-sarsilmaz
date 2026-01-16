/**
 * Pure translation functions - NO I/O operations
 * All file operations are handled in content.translations.ts
 */

export interface Product {
  id: string;
  lang: string;
  url: string;
  manufacturer: string;
  category_slug: string;
  category_name: string;
  name: string;
  name_short: string;
  slug: string;
  model_name: string;
  lead: string;
  description: string[];
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
  extra_data: Array<{
    id: string;
    name: string;
    value: string;
  }>;
  images: string[];
}

export interface Category {
  id: string;
  lang: string;
  manufacturer: string;
  name: string;
  slug: string;
}

export interface TranslationDictionaries {
  attributeGroups: Record<string, string>;
  attributes: Record<string, string>;
  variants: Record<string, string>;
  descriptions: Record<string, string[]>;
  categories: Record<string, string>;
  attributeValues: Record<string, Record<string, string>>;
}

/**
 * Apply translations from dictionaries to an existing product
 * Warnings are logged but operation continues on missing translations
 * NOTE: Does NOT update lead/description as they're set during initial translation
 */
export function applyTranslationsToProduct(
  product: Product,
  dictionaries: TranslationDictionaries
): Product {
  const updatedProduct: Product = { ...product };

  // Translate category name
  if (dictionaries.categories[product.category_slug]) {
    updatedProduct.category_name = dictionaries.categories[product.category_slug];
  } else {
    console.warn(`  ⚠ Missing translation for category slug: ${product.category_slug}`);
  }

  // NOTE: Do NOT update lead/description here - they're preserved from previous translations.
  // These are set during initial translation (translations-init) and should not be overwritten
  // on subsequent updates to avoid losing manual translations.

  // Translate attribute groups and properties
  updatedProduct.attribute_groups = product.attribute_groups.map(group => {
    const translatedGroup = { ...group };

    // Translate group name
    if (dictionaries.attributeGroups[group.id]) {
      translatedGroup.name = dictionaries.attributeGroups[group.id];
    } else {
      console.warn(`  ⚠ Missing translation for attribute group: ${group.id}`);
    }

    // Translate properties
    translatedGroup.properties = group.properties.map(property => {
      const translatedProperty = { ...property };

      // Translate property name
      if (dictionaries.attributes[property.id]) {
        translatedProperty.name = dictionaries.attributes[property.id];
      } else {
        console.warn(`  ⚠ Missing translation for attribute: ${property.id}`);
      }

      // Translate property value from attribute-values dictionary
      if (dictionaries.attributeValues[product.id]?.[property.id]) {
        translatedProperty.value = dictionaries.attributeValues[product.id][property.id];
      } else {
        console.warn(`  ⚠ Missing translated value for attribute: ${property.id} in product: ${product.id}`);
      }

      return translatedProperty;
    });

    return translatedGroup;
  });

  // Translate variants
  updatedProduct.variants = product.variants.map(variant => {
    const translatedVariant = { ...variant };

    if (dictionaries.variants[variant.id]) {
      translatedVariant.name = dictionaries.variants[variant.id];
    } else {
      console.warn(`  ⚠ Missing translation for variant: ${variant.id}`);
    }

    return translatedVariant;
  });

  return updatedProduct;
}

/**
 * Translate a single product from source language to target language using dictionaries
 * Throws error on missing translations
 */
export function translateProduct(
  product: Product,
  targetLang: string,
  dictionaries: TranslationDictionaries
): Product {
  const translatedProduct: Product = { ...product };

  // Update language
  translatedProduct.lang = targetLang;

  // Translate category name
  if (!dictionaries.categories[product.category_slug]) {
    throw new Error(`Missing translation for category slug: ${product.category_slug}`);
  }
  translatedProduct.category_name = dictionaries.categories[product.category_slug];

  // Translate description
  if (!dictionaries.descriptions[product.id]) {
    throw new Error(`Missing translation for description of product: ${product.id}`);
  }
  translatedProduct.description = dictionaries.descriptions[product.id];

  // Translate attribute groups and properties
  translatedProduct.attribute_groups = product.attribute_groups.map(group => {
    if (!dictionaries.attributeGroups[group.id]) {
      throw new Error(`Missing translation for attribute group: ${group.id}`);
    }

    const translatedGroup = {
      ...group,
      name: dictionaries.attributeGroups[group.id],
      properties: group.properties.map(property => {
        if (!dictionaries.attributes[property.id]) {
          throw new Error(`Missing translation for attribute: ${property.id}`);
        }

        // Get translated value from attribute-values dictionary
        if (!dictionaries.attributeValues[product.id]) {
          throw new Error(`Missing attribute values for product: ${product.id}`);
        }

        if (!dictionaries.attributeValues[product.id][property.id]) {
          throw new Error(`Missing translated value for attribute: ${property.id} in product: ${product.id}`);
        }

        return {
          ...property,
          name: dictionaries.attributes[property.id],
          value: dictionaries.attributeValues[product.id][property.id]
        };
      })
    };

    return translatedGroup;
  });

  // Translate variants
  translatedProduct.variants = product.variants.map(variant => {
    if (!dictionaries.variants[variant.id]) {
      throw new Error(`Missing translation for variant: ${variant.id}`);
    }

    return {
      ...variant,
      name: dictionaries.variants[variant.id]
    };
  });

  return translatedProduct;
}

/**
 * Translate a single category using dictionary
 */
export function translateCategory(
  category: Category,
  targetLang: string,
  categoriesDict: Record<string, string>
): Category {
  if (!categoriesDict[category.id]) {
    throw new Error(`Missing translation for category: ${category.id}`);
  }

  return {
    ...category,
    lang: targetLang,
    name: categoriesDict[category.id]
  };
}
