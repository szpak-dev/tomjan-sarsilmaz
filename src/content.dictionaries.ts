import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

type Dictionary = Record<string, string>;
type DescriptionsDictionary = Record<string, string[]>;
type AttributeValuesDictionary = Record<string, Record<string, string>>;

interface Product {
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

/** * Sort object keys alphabetically (ascending)
 */
function sortKeys<T extends Record<string, any>>(obj: T): T {
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

/** * Build attribute groups dictionary from all products in a given language
 * Uses id as key and name as value
 */
async function buildAttributeGroupsDictionary(language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const productsDir = path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'attribute-groups.json');
  if (fs.existsSync(dictionaryPath)) {
    const existing = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    Object.assign(dictionary, existing);
  }

  // Iterate through all product files
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(productsDir, file);
      const product: Product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Extract attribute group ids and names
      for (const group of product.attribute_groups || []) {
        if (group.id && group.name && !dictionary[group.id]) {
          dictionary[group.id] = group.name;
        }
      }
    }
  }

  return dictionary;
}

/**
 * Build attributes dictionary from all products in a given language
 * Uses id as key and name as value
 */
async function buildAttributesDictionary(language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const productsDir = path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'attributes.json');
  if (fs.existsSync(dictionaryPath)) {
    const existing = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    Object.assign(dictionary, existing);
  }

  // Iterate through all product files
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(productsDir, file);
      const product: Product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Extract attribute ids and names from properties
      for (const group of product.attribute_groups || []) {
        for (const property of group.properties || []) {
          if (property.id && property.name && !dictionary[property.id]) {
            dictionary[property.id] = property.name;
          }
        }
      }
    }
  }

  return dictionary;
}

/**
 * Build variants dictionary from all products in a given language
 * Uses id as key and name as value
 */
async function buildVariantsDictionary(language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const productsDir = path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'variants.json');
  if (fs.existsSync(dictionaryPath)) {
    const existing = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    Object.assign(dictionary, existing);
  }

  // Iterate through all product files
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(productsDir, file);
      const product: Product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Extract variant ids and names
      for (const variant of product.variants || []) {
        if (variant.id && variant.name && !dictionary[variant.id]) {
          dictionary[variant.id] = variant.name;
        }
      }
    }
  }

  return dictionary;
}

/**
 * Build descriptions dictionary from all products in a given language
 * Uses product id as key and description array as value
 */
async function buildDescriptionsDictionary(language: string): Promise<DescriptionsDictionary> {
  const dictionary: DescriptionsDictionary = {};
  const productsDir = path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'descriptions.json');
  if (fs.existsSync(dictionaryPath)) {
    const existing = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    Object.assign(dictionary, existing);
  }

  // Iterate through all product files
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(productsDir, file);
      const product: Product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Extract product id and description
      if (product.id && product.description && !dictionary[product.id]) {
        dictionary[product.id] = product.description;
      }
    }
  }

  return dictionary;
}

/**
 * Build categories dictionary from scraped categories JSONL file
 * Uses category id as key and category name as value
 */
async function buildCategoriesDictionary(language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const scrapedCategoriesPath = path.join(projectRoot, 'scraped', 'categories.jsonl');

  // Load existing dictionary if it exists
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'categories.json');
  if (fs.existsSync(dictionaryPath)) {
    const existing = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    Object.assign(dictionary, existing);
  }

  // Read categories from scraped JSONL file
  if (fs.existsSync(scrapedCategoriesPath)) {
    const content = fs.readFileSync(scrapedCategoriesPath, 'utf-8');
    const lines = content.trim().split('\n');

    for (const line of lines) {
      if (line.trim()) {
        const category = JSON.parse(line);
        
        // Extract category id and name
        if (category.id && category.name && !dictionary[category.id]) {
          dictionary[category.id] = category.name;
        }
      }
    }
  }

  return dictionary;
}

/**
 * Build attribute values dictionary from all products in a given language
 * Maps product ID to their attribute ID/value pairs
 */
async function buildAttributeValuesDictionary(language: string): Promise<AttributeValuesDictionary> {
  const dictionary: AttributeValuesDictionary = {};
  const productsDir = path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'attribute-values.json');
  if (fs.existsSync(dictionaryPath)) {
    const existing = JSON.parse(fs.readFileSync(dictionaryPath, 'utf-8'));
    Object.assign(dictionary, existing);
  }

  // Iterate through all product files
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(productsDir, file);
      const product: Product = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Extract attribute values for this product
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
  }

  return dictionary;
}

/**
 * Generate and save all dictionaries for a given language
 */
export async function generateDictionaries(language: string): Promise<void> {
  const dictDir = path.join(projectRoot, 'src', 'content', 'dictionaries', language);

  // Ensure directory exists
  if (!fs.existsSync(dictDir)) {
    fs.mkdirSync(dictDir, { recursive: true });
  }

  // Build and save each dictionary
  const attributeGroups = await buildAttributeGroupsDictionary(language);
  fs.writeFileSync(
    path.join(dictDir, 'attribute-groups.json'),
    JSON.stringify(sortKeys(attributeGroups), null, 4) + '\n'
  );

  const attributes = await buildAttributesDictionary(language);
  fs.writeFileSync(
    path.join(dictDir, 'attributes.json'),
    JSON.stringify(sortKeys(attributes), null, 4) + '\n'
  );

  const variants = await buildVariantsDictionary(language);
  fs.writeFileSync(
    path.join(dictDir, 'variants.json'),
    JSON.stringify(sortKeys(variants), null, 4) + '\n'
  );

  const descriptions = await buildDescriptionsDictionary(language);
  fs.writeFileSync(
    path.join(dictDir, 'descriptions.json'),
    JSON.stringify(sortKeys(descriptions), null, 4) + '\n'
  );

  const categories = await buildCategoriesDictionary(language);
  fs.writeFileSync(
    path.join(dictDir, 'categories.json'),
    JSON.stringify(sortKeys(categories), null, 4) + '\n'
  );

  const attributeValues = await buildAttributeValuesDictionary(language);
  fs.writeFileSync(
    path.join(dictDir, 'attribute-values.json'),
    JSON.stringify(sortKeys(attributeValues), null, 4) + '\n'
  );

  console.log(`✓ Dictionaries generated for language: ${language}`);
}

/**
 * Synchronize dictionaries from source language to target language
 * Only adds missing keys, does not overwrite existing ones
 */
export async function synchronize(sourceLang: string, targetLang: string): Promise<void> {
  const sourceDictDir = path.join(projectRoot, 'src', 'content', 'dictionaries', sourceLang);
  const targetDictDir = path.join(projectRoot, 'src', 'content', 'dictionaries', targetLang);

  // Ensure target directory exists
  if (!fs.existsSync(targetDictDir)) {
    fs.mkdirSync(targetDictDir, { recursive: true });
  }

  // List of dictionary files to synchronize
  const dictionaryFiles = [
    'attribute-groups.json',
    'attributes.json',
    'variants.json',
    'descriptions.json',
    'categories.json',
    'attribute-values.json'
  ];

  console.log(`Synchronizing dictionaries from ${sourceLang} to ${targetLang}...\n`);

  for (const fileName of dictionaryFiles) {
    const sourceFile = path.join(sourceDictDir, fileName);
    const targetFile = path.join(targetDictDir, fileName);

    if (!fs.existsSync(sourceFile)) {
      console.log(`⊘ Skipping ${fileName} (source file not found)`);
      continue;
    }

    // Load source dictionary
    const sourceDict = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));

    // Load target dictionary or create empty one
    let targetDict: any = {};
    if (fs.existsSync(targetFile)) {
      targetDict = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    }

    // Synchronize: add missing keys from source to target
    let addedCount = 0;
    for (const key in sourceDict) {
      if (!targetDict[key]) {
        targetDict[key] = sourceDict[key];
        addedCount++;
      }
    }

    // Save synchronized target dictionary
    fs.writeFileSync(
      targetFile,
      JSON.stringify(sortKeys(targetDict), null, 4) + '\n'
    );

    if (addedCount > 0) {
      console.log(`✓ ${fileName}: added ${addedCount} new key(s)`);
    } else {
      console.log(`✓ ${fileName}: up to date`);
    }
  }

  console.log(`\n✓ Synchronization complete: ${sourceLang} → ${targetLang}`);
}

// Main entry point for CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'sync') {
    // Synchronize mode: dictionaries:sync <sourceLang> <targetLang>
    const sourceLang = args[1];
    const targetLang = args[2];

    if (!sourceLang || !targetLang) {
      console.error('Error: Both source and target languages are required');
      console.error('Usage: npm run dictionaries:sync -- <sourceLang> <targetLang>');
      process.exit(1);
    }

    await synchronize(sourceLang, targetLang);
  } else {
    // Generate mode: build dictionaries for languages found in scraped products
    const scrapedProductsPath = path.resolve(projectRoot, 'scraped', 'products.jsonl');
    const languages = new Set<string>();

    if (fs.existsSync(scrapedProductsPath)) {
      const content = fs.readFileSync(scrapedProductsPath, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          const product = JSON.parse(line);
          if (product.lang) {
            languages.add(product.lang);
          }
        }
      }
    }

    if (languages.size === 0) {
      console.error('Error: No languages found in scraped products');
      process.exit(1);
    }

    console.log(`Starting dictionary generation for languages: ${Array.from(languages).join(', ')}\n`);

    for (const language of languages) {
      await generateDictionaries(language);
    }

    console.log('\n✓ All dictionaries generated successfully');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
