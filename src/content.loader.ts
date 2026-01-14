import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.debug(`__filename: ${__filename}`);
console.debug(`__dirname: ${__dirname}`);
console.debug(`projectRoot: ${projectRoot}`);

interface ScrapedProduct {
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

interface ScrapedCategory {
  id: string;
  manufacturer: string;
  name: string;
  slug: string;
}

/**
 * Reads JSONL file and yields objects line by line
 */
async function* readJsonlFile(filePath: string) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      yield JSON.parse(line);
    }
  }
}

/**
 * Find all manufacturers (subdirectories) in the scraped folder
 * Returns empty array if using legacy structure (files in scraped root)
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

/**
 * Load and transform scraped products from JSONL into collection files
 * This function reads from scraped/{manufacturer}/products.jsonl and creates individual JSON files
 * organized by manufacturer and language in src/content/products/{manufacturer}/{lang}/
 */
export async function loadScrapedProducts(): Promise<void> {
  const manufacturers = findManufacturers();
  const productsBasePath = path.resolve(projectRoot, 'src', 'content', 'products');

  if (manufacturers.length === 0) {
    console.warn('No manufacturer directories found in scraped folder');
    return;
  }

  for (const manufacturer of manufacturers) {
    const scrapedProductsPath = manufacturer 
      ? path.resolve(projectRoot, 'scraped', manufacturer, 'products.jsonl')
      : path.resolve(projectRoot, 'scraped', 'products.jsonl');
    
    if (!fs.existsSync(scrapedProductsPath)) {
      console.warn(`Scraped products file not found at ${scrapedProductsPath}`);
      continue;
    }

    if (manufacturer) {
      console.log(`\nProcessing manufacturer: ${manufacturer}`);
    } else {
      console.log(`\nProcessing products (legacy structure)`);
    }
    
    // Create language directories and store products
    const productsByLang: Map<string, ScrapedProduct[]> = new Map();

    for await (const product of readJsonlFile(scrapedProductsPath)) {
      const typedProduct = product as ScrapedProduct;
      
      if (!productsByLang.has(typedProduct.lang)) {
        productsByLang.set(typedProduct.lang, []);
      }
      productsByLang.get(typedProduct.lang)!.push(typedProduct);
    }

      // Write products to individual files
    for (const [lang, products] of productsByLang) {
      console.debug(`Processing language: ${lang}${manufacturer ? `, manufacturer: ${manufacturer}` : ''}`);
      const langPath = manufacturer 
        ? path.join(productsBasePath, manufacturer, lang)
        : path.join(productsBasePath, lang);

      // Create manufacturer/language or language directory if it doesn't exist
      if (!fs.existsSync(langPath)) {
        fs.mkdirSync(langPath, { recursive: true });
      }

      // Write each product to its own file
      for (const product of products) {
        const fileName = `${product.slug}.json`;
        const filePath = path.join(langPath, fileName);
        
        // Transform product to match content schema exactly
        const contentProduct = {
          id: product.id,
          lang: product.lang,
          url: product.url,
          manufacturer: product.manufacturer,
          category_slug: product.category_slug,
          category_name: product.category_name,
          name: product.name,
          name_short: product.name_short || '',
          slug: product.slug,
          model_name: product.model_name || '',
          lead: product.lead || '',
          description: product.description || [],
          attribute_groups: product.attribute_groups || [],
          variants: product.variants || [],
          extra_data: product.extra_data || [],
          images: product.images || [],
        };

        fs.writeFileSync(filePath, JSON.stringify(contentProduct, null, 2) + '\n');
        console.log(`Created/updated product file: ${filePath}`);
      }
    }
  }
}

/**
 * Load and transform scraped categories from JSONL
 * This function reads from scraped/{manufacturer}/categories.jsonl for reference
 */
export async function loadScrapedCategories(): Promise<Array<{
  id: string;
  manufacturer: string;
  name: string;
  slug: string;
}>> {
  const manufacturers = findManufacturers();
  const categories: Array<any> = [];

  if (manufacturers.length === 0) {
    console.warn('No manufacturer directories found in scraped folder');
    return categories;
  }

  for (const manufacturer of manufacturers) {
    const scrapedCategoriesPath = manufacturer
      ? path.resolve(projectRoot, 'scraped', manufacturer, 'categories.jsonl')
      : path.resolve(projectRoot, 'scraped', 'categories.jsonl');
    
    if (!fs.existsSync(scrapedCategoriesPath)) {
      console.warn(`Scraped categories file not found at ${scrapedCategoriesPath}`);
      continue;
    }

    for await (const category of readJsonlFile(scrapedCategoriesPath)) {
      categories.push(category);
    }
  }

  return categories;
}

/**
 * Load and transform scraped categories from JSONL into collection files
 * This function reads from scraped/{manufacturer}/categories.jsonl and creates individual JSON files
 * organized by manufacturer and language in src/content/categories/{manufacturer}/{lang}/
 * Only creates categories for languages that exist in scraped products
 */
export async function loadCategoriesToContent(): Promise<void> {
  const manufacturers = findManufacturers();
  const categoriesBasePath = path.resolve(projectRoot, 'src', 'content', 'categories');

  if (manufacturers.length === 0) {
    console.warn('No manufacturer directories found in scraped folder');
    return;
  }

  for (const manufacturer of manufacturers) {
    const scrapedCategoriesPath = manufacturer
      ? path.resolve(projectRoot, 'scraped', manufacturer, 'categories.jsonl')
      : path.resolve(projectRoot, 'scraped', 'categories.jsonl');
    const scrapedProductsPath = manufacturer
      ? path.resolve(projectRoot, 'scraped', manufacturer, 'products.jsonl')
      : path.resolve(projectRoot, 'scraped', 'products.jsonl');

    if (!fs.existsSync(scrapedCategoriesPath)) {
      console.warn(`Scraped categories file not found at ${scrapedCategoriesPath}`);
      continue;
    }

    if (manufacturer) {
      console.log(`\nProcessing categories for manufacturer: ${manufacturer}`);
    } else {
      console.log(`\nProcessing categories (legacy structure)`);
    }

    // Determine which languages exist in scraped products
    const availableLanguages = new Set<string>();
    if (fs.existsSync(scrapedProductsPath)) {
      for await (const product of readJsonlFile(scrapedProductsPath)) {
        const typedProduct = product as ScrapedProduct;
        if (typedProduct.lang) {
          availableLanguages.add(typedProduct.lang);
        }
      }
    }

    if (availableLanguages.size === 0) {
      console.warn(`No languages found in scraped products for ${manufacturer}`);
      continue;
    }

    // Load translation dictionaries to get localized names
    const translationDictionaries: Map<string, Map<string, string>> = new Map();
    const dictionariesPath = path.resolve(projectRoot, 'src', 'content', 'dictionaries');
    
    for (const lang of availableLanguages) {
      const categoriesDictPath = manufacturer
        ? path.join(dictionariesPath, manufacturer, lang, 'categories.json')
        : path.join(dictionariesPath, lang, 'categories.json');
      if (fs.existsSync(categoriesDictPath)) {
        const dictContent = JSON.parse(fs.readFileSync(categoriesDictPath, 'utf-8'));
        translationDictionaries.set(lang, new Map(Object.entries(dictContent)));
      }
    }

    // Read all categories
    const categories: ScrapedCategory[] = [];
    for await (const category of readJsonlFile(scrapedCategoriesPath)) {
      categories.push(category as ScrapedCategory);
    }

    // Write categories for each language found in products
    for (const lang of availableLanguages) {
      const langPath = manufacturer
        ? path.join(categoriesBasePath, manufacturer, lang)
        : path.join(categoriesBasePath, lang);

      // Create manufacturer/language or language directory if it doesn't exist
      if (!fs.existsSync(langPath)) {
        fs.mkdirSync(langPath, { recursive: true });
      }

      const langDict = translationDictionaries.get(lang);

      // Write each category to its own file
      for (const category of categories) {
        const fileName = `${category.slug}.json`;
        const filePath = path.join(langPath, fileName);
        
        // Get localized name from dictionary, fallback to original name
        const localizedName = langDict?.get(category.id) || category.name;

        // Transform category to match content schema exactly
        const contentCategory = {
          id: category.id,
          lang: lang,
          manufacturer: category.manufacturer,
          name: localizedName,
          slug: category.slug,
        };

        fs.writeFileSync(filePath, JSON.stringify(contentCategory, null, 2) + '\n');
        console.log(`Created/updated category file: ${filePath}`);
      }
    }
  }
}

// Run the loader if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      console.log('Loading scraped products...');
      await loadScrapedProducts();
      console.log('✓ Products loaded successfully');
      
      console.log('Loading scraped categories...');
      await loadCategoriesToContent();
      console.log('✓ Categories loaded successfully');
    } catch (error) {
      console.error('✗ Error loading content:', error);
      process.exit(1);
    }
  })();
}
