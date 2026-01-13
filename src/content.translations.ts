import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

interface Product {
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

interface Category {
  id: string;
  lang: string;
  manufacturer: string;
  name: string;
  slug: string;
}

/**
 * Load dictionary from file
 */
function loadDictionary<T = any>(language: string, fileName: string): T {
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, fileName);
  
  if (!fs.existsSync(dictionaryPath)) {
    throw new Error(`Dictionary file not found: ${dictionaryPath}`);
  }
  
  return JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
}

/**
 * Translate a single product from source language to target language using dictionaries
 */
function translateProduct(
  product: Product,
  targetLang: string,
  dictionaries: {
    attributeGroups: Record<string, string>;
    attributes: Record<string, string>;
    variants: Record<string, string>;
    descriptions: Record<string, string[]>;
    categories: Record<string, string>;
    attributeValues: Record<string, Record<string, string>>;
  }
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
 * Translate all products from source language to target language
 */
export async function translateProducts(sourceLang: string, targetLang: string): Promise<void> {
  console.log(`Translating products from ${sourceLang} to ${targetLang}...\n`);
  
  // Load all dictionaries for target language
  console.log('Loading dictionaries...');
  const dictionaries = {
    attributeGroups: loadDictionary<Record<string, string>>(targetLang, 'attribute-groups.json'),
    attributes: loadDictionary<Record<string, string>>(targetLang, 'attributes.json'),
    variants: loadDictionary<Record<string, string>>(targetLang, 'variants.json'),
    descriptions: loadDictionary<Record<string, string[]>>(targetLang, 'descriptions.json'),
    categories: loadDictionary<Record<string, string>>(targetLang, 'categories.json'),
    attributeValues: loadDictionary<Record<string, Record<string, string>>>(targetLang, 'attribute-values.json')
  };
  console.log('✓ Dictionaries loaded\n');
  
  // Get source products directory
  const sourceProductsDir = path.join(projectRoot, 'src', 'content', 'products', sourceLang);
  if (!fs.existsSync(sourceProductsDir)) {
    throw new Error(`Source products directory not found: ${sourceProductsDir}`);
  }
  
  // Get target products directory
  const targetProductsDir = path.join(projectRoot, 'src', 'content', 'products', targetLang);
  if (!fs.existsSync(targetProductsDir)) {
    fs.mkdirSync(targetProductsDir, { recursive: true });
  }
  
  // Get all product files
  const productFiles = fs.readdirSync(sourceProductsDir).filter(file => file.endsWith('.json'));
  console.log(`Found ${productFiles.length} products to translate\n`);
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const file of productFiles) {
    try {
      const sourceFilePath = path.join(sourceProductsDir, file);
      const targetFilePath = path.join(targetProductsDir, file);
      
      // Check if target file already exists
      if (fs.existsSync(targetFilePath)) {
        console.log(`⊘ ${file} - already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      // Load source product
      const sourceProduct: Product = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));
      
      // Translate product
      const translatedProduct = translateProduct(sourceProduct, targetLang, dictionaries);
      
      // Save translated product
      fs.writeFileSync(
        targetFilePath,
        JSON.stringify(translatedProduct, null, 2) + '\n'
      );
      
      console.log(`✓ ${file}`);
      successCount++;
    } catch (error) {
      console.error(`✗ ${file}: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
      throw error; // Stop on first error
    }
  }
  
  console.log(`\n✓ Translation complete: ${successCount} products translated, ${skippedCount} skipped`);
  
  if (errorCount > 0) {
    throw new Error(`Translation failed with ${errorCount} error(s)`);
  }
}

/**
 * Translate all categories from source language to target language
 */
export async function translateCategories(sourceLang: string, targetLang: string): Promise<void> {
  console.log(`\nTranslating categories from ${sourceLang} to ${targetLang}...\n`);
  
  // Load categories dictionary for target language
  console.log('Loading categories dictionary...');
  const categoriesDict = loadDictionary<Record<string, string>>(targetLang, 'categories.json');
  console.log('✓ Dictionary loaded\n');
  
  // Get source categories directory
  const sourceCategoriesDir = path.join(projectRoot, 'src', 'content', 'categories', sourceLang);
  if (!fs.existsSync(sourceCategoriesDir)) {
    console.log(`Source categories directory not found: ${sourceCategoriesDir}, skipping categories`);
    return;
  }
  
  // Get target categories directory
  const targetCategoriesDir = path.join(projectRoot, 'src', 'content', 'categories', targetLang);
  if (!fs.existsSync(targetCategoriesDir)) {
    fs.mkdirSync(targetCategoriesDir, { recursive: true });
  }
  
  // Get all category files
  const categoryFiles = fs.readdirSync(sourceCategoriesDir).filter(file => file.endsWith('.json'));
  console.log(`Found ${categoryFiles.length} categories to translate\n`);
  
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const file of categoryFiles) {
    try {
      const sourceFilePath = path.join(sourceCategoriesDir, file);
      const targetFilePath = path.join(targetCategoriesDir, file);
      
      // Check if target file already exists
      if (fs.existsSync(targetFilePath)) {
        console.log(`⊘ ${file} - already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      // Load source category
      const sourceCategory: Category = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));
      
      // Translate category name using dictionary
      if (!categoriesDict[sourceCategory.id]) {
        throw new Error(`Missing translation for category: ${sourceCategory.id}`);
      }
      
      const translatedCategory: Category = {
        ...sourceCategory,
        lang: targetLang,
        name: categoriesDict[sourceCategory.id]
      };
      
      // Save translated category
      fs.writeFileSync(
        targetFilePath,
        JSON.stringify(translatedCategory, null, 2) + '\n'
      );
      
      console.log(`✓ ${file}`);
      successCount++;
    } catch (error) {
      console.error(`✗ ${file}: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
      throw error; // Stop on first error
    }
  }
  
  console.log(`\n✓ Categories translation complete: ${successCount} categories translated, ${skippedCount} skipped`);
  
  if (errorCount > 0) {
    throw new Error(`Categories translation failed with ${errorCount} error(s)`);
  }
}

// Main entry point for CLI execution
async function main() {
  const args = process.argv.slice(2);
  const sourceLang = args[0];
  const targetLang = args[1];
  
  if (!sourceLang || !targetLang) {
    console.error('Error: Both source and target languages are required');
    console.error('Usage: npm run translations -- <sourceLang> <targetLang>');
    process.exit(1);
  }
  
  await translateProducts(sourceLang, targetLang);
  await translateCategories(sourceLang, targetLang);
}

main().catch((error) => {
  console.error('\nError:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
