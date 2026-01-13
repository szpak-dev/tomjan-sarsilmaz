# Product Translation System

A reusable system for managing multilingual product content with dictionary-based translations.

---

## First-Time Setup

Starting from scraped data to fully translated products:

### 1. Load scraped content into JSON files
```bash
npm run load:contents
```
Reads `scraped/products.jsonl` and creates individual product files in `src/content/products/{lang}/`

### 2. Build translation dictionaries
```bash
npm run dicts:build
```
Extracts all translatable strings from products and creates empty dictionary files in `src/content/dictionaries/{lang}/`

### 3. Translate dictionary values (manual step)
Open `src/content/dictionaries/pl/*.json` files and translate all values from English to Polish

### 4. Apply translations to products
```bash
npm run translations:update -- pl
```
Updates all Polish product files with translated values from dictionaries

### 5. Done! 
Products now have Polish translations applied

---

## Updating Workflow

When you modify translations or add new products:

### Update existing translations
```bash
# 1. Edit dictionary files in src/content/dictionaries/pl/
# 2. Apply changes to products
npm run translations:update -- pl
```

### Add new products
```bash
# 1. Add products to scraped/products.jsonl
npm run load:contents

# 2. Sync new keys to dictionaries
npm run dicts:sync -- en pl

# 3. Translate new keys in dictionaries (manual)

# 4. Apply translations to products
npm run translations:update -- pl
```

---

## Directory Structure

```
scraped/
  products.jsonl          # Source data
  
src/content/
  products/
    en/                   # English products (source)
    pl/                   # Polish products (target)
  dictionaries/
    pl/                   # Polish translations (single source of truth)
      attribute-groups.json
      attributes.json
      attribute-values.json
      categories.json
      descriptions.json
      variants.json
```

---

## Dictionary Types

- **attribute-groups.json** - Section headers (e.g., "Specification" → "Specyfikacja")
- **attributes.json** - Attribute names (e.g., "Caliber" → "Kaliber")
- **attribute-values.json** - Product-specific values (nested by product ID)
- **categories.json** - Category names by slug
- **descriptions.json** - Product descriptions (arrays by product ID)
- **variants.json** - Variant names (e.g., "Color" → "Kolor")

---

## Source Files

- `src/content.loader.ts` - Loads JSONL → JSON files
- `src/content.dictionaries.ts` - Builds/syncs dictionaries
- `src/content.translations.ts` - Applies translations
