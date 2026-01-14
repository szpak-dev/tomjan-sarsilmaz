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
async function buildAttributeGroupsDictionary(manufacturer: string, language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const productsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, language)
    : path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, 'attribute-groups.json')
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'attribute-groups.json');
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
async function buildAttributesDictionary(manufacturer: string, language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const productsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, language)
    : path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, 'attributes.json')
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'attributes.json');
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
async function buildVariantsDictionary(manufacturer: string, language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const productsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, language)
    : path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, 'variants.json')
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'variants.json');
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
async function buildDescriptionsDictionary(manufacturer: string, language: string): Promise<DescriptionsDictionary> {
  const dictionary: DescriptionsDictionary = {};
  const productsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, language)
    : path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, 'descriptions.json')
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'descriptions.json');
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
async function buildCategoriesDictionary(manufacturer: string, language: string): Promise<Dictionary> {
  const dictionary: Dictionary = {};
  const scrapedCategoriesPath = manufacturer
    ? path.join(projectRoot, 'scraped', manufacturer, 'categories.jsonl')
    : path.join(projectRoot, 'scraped', 'categories.jsonl');

  // Load existing dictionary if it exists
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, 'categories.json')
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'categories.json');
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
async function buildAttributeValuesDictionary(manufacturer: string, language: string): Promise<AttributeValuesDictionary> {
  const dictionary: AttributeValuesDictionary = {};
  const productsDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'products', manufacturer, language)
    : path.join(projectRoot, 'src', 'content', 'products', language);

  // Load existing dictionary if it exists
  const dictionaryPath = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language, 'attribute-values.json')
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language, 'attribute-values.json');
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
export async function generateDictionaries(manufacturer: string, language: string): Promise<void> {
  const dictDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, language)
    : path.join(projectRoot, 'src', 'content', 'dictionaries', language);

  // Ensure directory exists
  if (!fs.existsSync(dictDir)) {
    fs.mkdirSync(dictDir, { recursive: true });
  }

  // Build and save each dictionary
  const attributeGroups = await buildAttributeGroupsDictionary(manufacturer, language);
  fs.writeFileSync(
    path.join(dictDir, 'attribute-groups.json'),
    JSON.stringify(sortKeys(attributeGroups), null, 4) + '\n'
  );

  const attributes = await buildAttributesDictionary(manufacturer, language);
  fs.writeFileSync(
    path.join(dictDir, 'attributes.json'),
    JSON.stringify(sortKeys(attributes), null, 4) + '\n'
  );

  const variants = await buildVariantsDictionary(manufacturer, language);
  fs.writeFileSync(
    path.join(dictDir, 'variants.json'),
    JSON.stringify(sortKeys(variants), null, 4) + '\n'
  );

  const descriptions = await buildDescriptionsDictionary(manufacturer, language);
  fs.writeFileSync(
    path.join(dictDir, 'descriptions.json'),
    JSON.stringify(sortKeys(descriptions), null, 4) + '\n'
  );

  const categories = await buildCategoriesDictionary(manufacturer, language);
  fs.writeFileSync(
    path.join(dictDir, 'categories.json'),
    JSON.stringify(sortKeys(categories), null, 4) + '\n'
  );

  const attributeValues = await buildAttributeValuesDictionary(manufacturer, language);
  fs.writeFileSync(
    path.join(dictDir, 'attribute-values.json'),
    JSON.stringify(sortKeys(attributeValues), null, 4) + '\n'
  );

  if (manufacturer) {
    console.log(`✓ Dictionaries generated for manufacturer: ${manufacturer}, language: ${language}`);
  } else {
    console.log(`✓ Dictionaries generated for language: ${language}`);
  }
}

/**
 * Synchronize dictionaries from source language to target language
 * Only adds missing keys, does not overwrite existing ones
 */
export async function synchronize(manufacturer: string, sourceLang: string, targetLang: string): Promise<void> {
  const sourceDictDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, sourceLang)
    : path.join(projectRoot, 'src', 'content', 'dictionaries', sourceLang);
  const targetDictDir = manufacturer
    ? path.join(projectRoot, 'src', 'content', 'dictionaries', manufacturer, targetLang)
    : path.join(projectRoot, 'src', 'content', 'dictionaries', targetLang);

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

  if (manufacturer) {
    console.log(`Synchronizing ${manufacturer} dictionaries from ${sourceLang} to ${targetLang}...\n`);
  } else {
    console.log(`Synchronizing dictionaries from ${sourceLang} to ${targetLang}...\n`);
  }

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

/**
 * Find all manufacturers (subdirectories) in the scraped folder
 */
function findManufacturers(): string[] {
  const scrapedPath = path.resolve(projectRoot, 'scraped');
  
  if (!fs.existsSync(scrapedPath)) {
    return [];
  }
  
  // Check if using legacy structure (files directly in scraped folder)
  const hasLegacyFiles = fs.readdirSync(scrapedPath)
    .some(item => item.endsWith('.jsonl'));
  
  if (hasLegacyFiles) {
    // Legacy structure: use empty string to represent no manufacturer subfolder
    return [''];
  }
  
  // New structure: return subdirectories as manufacturers
  return fs.readdirSync(scrapedPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Main entry point for CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'sync') {
    // Synchronize mode with two formats:
    // New: dictionaries:sync <manufacturer> <sourceLang> <targetLang>
    // Legacy: dictionaries:sync <sourceLang> <targetLang>
    if (args.length === 3) {
      // Legacy format: sourceLang targetLang
      const sourceLang = args[1];
      const targetLang = args[2];
      await synchronize('', sourceLang, targetLang);
    } else if (args.length === 4) {
      // New format: manufacturer sourceLang targetLang
      const manufacturer = args[1];
      const sourceLang = args[2];
      const targetLang = args[3];
      await synchronize(manufacturer, sourceLang, targetLang);
    } else {
      console.error('Error: Invalid arguments');
      console.error('Usage: npm run dictionaries:sync -- <manufacturer> <sourceLang> <targetLang>');
      console.error('   or: npm run dictionaries:sync -- <sourceLang> <targetLang> (legacy)');
      process.exit(1);
    }
  } else {
    // Generate mode: build dictionaries for manufacturers and languages found in scraped products
    const manufacturers = findManufacturers();
    
    if (manufacturers.length === 0) {
      console.error('Error: No manufacturer directories found in scraped folder');
      process.exit(1);
    }

    console.log(`Found manufacturers: ${manufacturers.join(', ')}\n`);

    for (const manufacturer of manufacturers) {
      const scrapedProductsPath = path.resolve(projectRoot, 'scraped', manufacturer, 'products.jsonl');
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
        console.warn(`No languages found in scraped products${manufacturer ? ` for ${manufacturer}` : ''}`);
        continue;
      }

      if (manufacturer) {
        console.log(`Generating dictionaries for ${manufacturer}, languages: ${Array.from(languages).join(', ')}`);
      } else {
        console.log(`Generating dictionaries for languages: ${Array.from(languages).join(', ')}`);
      }

      for (const language of languages) {
        await generateDictionaries(manufacturer, language);
      }
    }

    console.log('\n✓ All dictionaries generated successfully');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
