import { translateWithGondor as translateWithGemini, batchTranslateWithGondor as batchTranslateWithGemini } from './gondor.ts';
import type { Product, Category } from './translate.ts';

/**
 * Automatic translation service using Gondor translation endpoint
 * Pure translation functions - batch multiple items in single API calls
 * Progress management is orchestrated in content.translations.ts
 */

/**
 * Batch translate multiple products in a single API call
 * Extracts all text, sends in one request, reconstructs products
 */
export async function batchTranslateProducts(
  products: Product[],
  targetLang: string,
  sourceLang: string
): Promise<Product[]> {
  if (products.length === 0) return [];

  // Extract all text to translate with indices for reconstruction
  const textMap: Array<{
    productIdx: number;
    field: string;
    subIdx?: number | string;
    text: string;
  }> = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Descriptions (multiple lines per product)
    if (p.description && p.description.length > 0) {
      p.description.forEach((desc, idx) => {
        textMap.push({ productIdx: i, field: 'description', subIdx: idx, text: desc });
      });
    }

    // Category name
    if (p.category_name) {
      textMap.push({ productIdx: i, field: 'category_name', text: p.category_name });
    }

    // Attribute groups
    if (p.attribute_groups && p.attribute_groups.length > 0) {
      p.attribute_groups.forEach((group, groupIdx) => {
        textMap.push({
          productIdx: i,
          field: 'attribute_group_name',
          subIdx: groupIdx,
          text: group.name
        });

        if (group.properties && group.properties.length > 0) {
          group.properties.forEach((prop, propIdx) => {
            textMap.push({
              productIdx: i,
              field: 'attribute_property_name',
              subIdx: `${groupIdx}_${propIdx}`,
              text: prop.name
            });
            textMap.push({
              productIdx: i,
              field: 'attribute_property_value',
              subIdx: `${groupIdx}_${propIdx}`,
              text: prop.value
            });
          });
        }
      });
    }

    // Variants
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((variant, idx) => {
        textMap.push({ productIdx: i, field: 'variant_name', subIdx: idx, text: variant.name });
      });
    }
  }

  // Create prompt with all text to translate
  const textsToTranslate = textMap.map((item, idx) => `${idx + 1}. ${item.text}`).join('\n');

  const prompt = `Translate the following ${sourceLang} texts to ${targetLang}.
Return ONLY the translations, one per line, in exactly the same order as provided.
Do not number them. Do not add explanations. Just the translated text.

Texts:
${textsToTranslate}`;

  const translatedTexts = await batchTranslateWithGemini(
    textMap.map(t => t.text),
    sourceLang,
    targetLang
  );

  // Reconstruct products with translations
  const translatedProducts = JSON.parse(JSON.stringify(products)); // Deep copy

  for (let i = 0; i < textMap.length; i++) {
    const { productIdx, field, subIdx, text } = textMap[i];
    const translatedText = translatedTexts[i] || text; // Fallback to original

    const product = translatedProducts[productIdx];

    if (field === 'description' && typeof subIdx === 'number') {
      product.description[subIdx] = translatedText;
      if (subIdx === 0) product.lead = translatedText;
    } else if (field === 'category_name') {
      product.category_name = translatedText;
    } else if (field === 'attribute_group_name' && typeof subIdx === 'number') {
      product.attribute_groups[subIdx].name = translatedText;
    } else if (field === 'attribute_property_name' && typeof subIdx === 'string') {
      const [groupIdx, propIdx] = subIdx.split('_').map(Number);
      product.attribute_groups[groupIdx].properties[propIdx].name = translatedText;
    } else if (field === 'attribute_property_value' && typeof subIdx === 'string') {
      const [groupIdx, propIdx] = subIdx.split('_').map(Number);
      product.attribute_groups[groupIdx].properties[propIdx].value = translatedText;
    } else if (field === 'variant_name' && typeof subIdx === 'number') {
      product.variants[subIdx].name = translatedText;
    }
  }

  // Set language
  translatedProducts.forEach((p: Product) => {
    p.lang = targetLang;
  });

  return translatedProducts;
}

/**
 * Batch translate multiple categories in a single API call
 */
export async function batchTranslateCategories(
  categories: Category[],
  targetLang: string,
  sourceLang: string
): Promise<Category[]> {
  if (categories.length === 0) return [];

  // Extract category names
  const names = categories.map(c => c.name);

  // Translate all names in one batch call
  const translatedNames = await batchTranslateWithGemini(names, sourceLang, targetLang);

  // Reconstruct categories
  return categories.map((cat, idx) => ({
    ...cat,
    lang: targetLang,
    name: translatedNames[idx] || cat.name
  }));
}
