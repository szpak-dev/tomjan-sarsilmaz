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
function loadDictionary<T = any>(manufacturer: string, language: string, fileName: string): T {
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, fileName)
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, fileName);
  
  if (!fs.existsSync(dictionaryPath)) {
    throw new Error(`Dictionary file not found: ${dictionaryPath}`);
  }
  
  return JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
}

/**
 * Apply translations from dictionaries to an existing product
 */
function applyTranslationsToProduct(
  product: Product,
  dictionaries: {
    attributeGroups: Record<string, string>;
    attributes: Record<string, string>;
    variants: Record<string, string>;
    descriptions: Record<string, string[]>;
    categories: Record<string, string>;
    attributeValues: Record<string, Record<string, string>>;
  }
): Product {
  const updatedProduct: Product = { ...product };
  
  // Translate category name
  if (dictionaries.categories[product.category_slug]) {
    updatedProduct.category_name = dictionaries.categories[product.category_slug];
  } else {
    console.warn(`  ⚠ Missing translation for category slug: ${product.category_slug}`);
  }
  
  // Translate lead (first description paragraph)
  if (dictionaries.descriptions[product.id]) {
    updatedProduct.lead = dictionaries.descriptions[product.id][0];
    updatedProduct.description = dictionaries.descriptions[product.id];
  } else {
    console.warn(`  ⚠ Missing translation for description of product: ${product.id}`);
  }
  
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
export async function translateProducts(manufacturer: string, sourceLang: string, targetLang: string): Promise<void> {
  console.log(`Translating ${manufacturer} products from ${sourceLang} to ${targetLang}...\n`);
  
  // Load all dictionaries for target language
  console.log('Loading dictionaries...');
  const dictionaries = {
    attributeGroups: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'attribute-groups.json'),
    attributes: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'attributes.json'),
    variants: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'variants.json'),
    descriptions: loadDictionary<Record<string, string[]>>(manufacturer, targetLang, 'descriptions.json'),
    categories: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'categories.json'),
    attributeValues: loadDictionary<Record<string, Record<string, string>>>(manufacturer, targetLang, 'attribute-values.json')
  };
  console.log('✓ Dictionaries loaded\n');
  
  // Get source products directory
  const sourceProductsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, sourceLang)
    : path.join(projectRoot, 'src', 'content', 'products', sourceLang);
  if (!fs.existsSync(sourceProductsDir)) {
    throw new Error(`Source products directory not found: ${sourceProductsDir}`);
  }
  
  // Get target products directory
  const targetProductsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, targetLang)
    : path.join(projectRoot, 'src', 'content', 'products', targetLang);
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
export async function translateCategories(manufacturer: string, sourceLang: string, targetLang: string): Promise<void> {
  console.log(`\nTranslating ${manufacturer} categories from ${sourceLang} to ${targetLang}...\n`);
  
  // Load categories dictionary for target language
  console.log('Loading categories dictionary...');
  const categoriesDict = loadDictionary<Record<string, string>>(manufacturer, targetLang, 'categories.json');
  console.log('✓ Dictionary loaded\n');
  
  // Get source categories directory
  const sourceCategoriesDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'categories', manufacturer, sourceLang)
    : path.join(projectRoot, 'src', 'content', 'categories', sourceLang);
  if (!fs.existsSync(sourceCategoriesDir)) {
    console.log(`Source categories directory not found: ${sourceCategoriesDir}, skipping categories`);
    return;
  }
  
  // Get target categories directory
  const targetCategoriesDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'categories', manufacturer, targetLang)
    : path.join(projectRoot, 'src', 'content', 'categories', targetLang);
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

/**
 * Update existing products with translations from dictionaries
 */
export async function updateProductTranslations(manufacturer: string, targetLang: string): Promise<void> {
  console.log(`Updating ${manufacturer} ${targetLang} products with dictionary translations...\n`);
  
  // Load all dictionaries for target language
  console.log('Loading dictionaries...');
  const dictionaries = {
    attributeGroups: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'attribute-groups.json'),
    attributes: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'attributes.json'),
    variants: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'variants.json'),
    descriptions: loadDictionary<Record<string, string[]>>(manufacturer, targetLang, 'descriptions.json'),
    categories: loadDictionary<Record<string, string>>(manufacturer, targetLang, 'categories.json'),
    attributeValues: loadDictionary<Record<string, Record<string, string>>>(manufacturer, targetLang, 'attribute-values.json')
  };
  console.log('✓ Dictionaries loaded\n');
  
  // Get target products directory
  const targetProductsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, targetLang)
    : path.join(projectRoot, 'src', 'content', 'products', targetLang);
  if (!fs.existsSync(targetProductsDir)) {
    throw new Error(`Target products directory not found: ${targetProductsDir}`);
  }
  
  // Get all product files
  const productFiles = fs.readdirSync(targetProductsDir).filter(file => file.endsWith('.json'));
  console.log(`Found ${productFiles.length} products to update\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of productFiles) {
    try {
      console.log(`Processing ${file}...`);
      const filePath = path.join(targetProductsDir, file);
      
      // Load existing product
      const existingProduct: Product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Apply translations
      const updatedProduct = applyTranslationsToProduct(existingProduct, dictionaries);
      
      // Save updated product
      fs.writeFileSync(
        filePath,
        JSON.stringify(updatedProduct, null, 2) + '\n'
      );
      
      console.log(`✓ ${file} updated\n`);
      successCount++;
    } catch (error) {
      console.error(`✗ ${file}: ${error instanceof Error ? error.message : String(error)}\n`);
      errorCount++;
    }
  }
  
  console.log(`\n✓ Update complete: ${successCount} products updated`);
  
  if (errorCount > 0) {
    console.log(`⚠ ${errorCount} product(s) had errors`);
  }
}

/**
 * Find all manufacturers (subdirectories) in the content/products folder
 */
function findManufacturers(): string[] {
  const productsPath = path.join(projectRoot, 'src', 'content', 'products');
  
  if (!fs.existsSync(productsPath)) {
    return [];
  }
  
  return fs.readdirSync(productsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Main entry point for CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'update') {
    const manufacturer = args[1];
    const targetLang = args[2] || args[1] || 'pl';
    
    // If only one arg after 'update', treat it as targetLang (legacy)
    if (args.length === 2) {
      await updateProductTranslations('', args[1]);
    } else {
      if (!manufacturer) {
        console.error('Error: Manufacturer is required');
        console.error('Usage: npm run translations -- update <manufacturer> <targetLang>');
        console.error('   or: npm run translations -- update <targetLang> (legacy)');
        process.exit(1);
      }
      await updateProductTranslations(manufacturer, targetLang);
    }
  } else {
    // Check if args match old format: <sourceLang> <targetLang>
    // or new format: <manufacturer> <sourceLang> <targetLang>
    if (args.length === 2) {
      // Legacy format: sourceLang targetLang
      const sourceLang = args[0];
      const targetLang = args[1];
      await translateProducts('', sourceLang, targetLang);
      await translateCategories('', sourceLang, targetLang);
    } else if (args.length === 3) {
      // New format: manufacturer sourceLang targetLang
      const manufacturer = args[0];
      const sourceLang = args[1];
      const targetLang = args[2];
      await translateProducts(manufacturer, sourceLang, targetLang);
      await translateCategories(manufacturer, sourceLang, targetLang);
    } else {
      console.error('Error: Invalid arguments');
      console.error('Usage: npm run translations -- <manufacturer> <sourceLang> <targetLang>');
      console.error('   or: npm run translations -- <sourceLang> <targetLang> (legacy)');
      console.error('   or: npm run translations -- update <manufacturer> <targetLang>');
      console.error('   or: npm run translations -- update <targetLang> (legacy)');
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error('\nError:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
