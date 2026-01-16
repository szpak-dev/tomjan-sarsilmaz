/**
 * Gondor Translation Service
 * Uses local translation endpoint for text translation
 */

const TRANSLATION_ENDPOINT = process.env.GONDOR_ENDPOINT || 'http://gondor:8080/translate';

interface TranslationRequest {
  text: string;
}

interface TranslationResponse {
  translation?: string;
  translated_text?: string;
  result?: string;
  [key: string]: any;
}

/**
 * Translate text using Gondor translation endpoint
 * @param text - Text to translate
 * @param sourceLanguage - Source language (e.g., 'English', 'Polish')
 * @param targetLanguage - Target language (e.g., 'Polish', 'English')
 * @returns Translated text
 */
export async function translateWithGondor(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // Preserve empty strings - don't translate them
  if (!text || text.trim().length === 0) {
    return text;
  }

  console.log(`🔄 Translating: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for longer texts
    
    const response = await fetch(TRANSLATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text
      } as TranslationRequest),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}: ${response.statusText}`);
    }

    const data: TranslationResponse = await response.json();
    
    // Try to extract translated text from common response formats
    // Gondor returns: {"translations": ["translated text"], ...}
    let translatedText = '';
    if (Array.isArray(data.translations) && data.translations.length > 0) {
      translatedText = data.translations[0];
    } else {
      translatedText = data.translation || data.translated_text || data.result || '';
    }

    // Safety check: ensure translation is not empty
    const trimmed = translatedText.trim();
    if (!trimmed) {
      console.warn(`⚠ Translation resulted in empty string for: "${text.substring(0, 50)}..."`);
      return text; // Fall back to original if translation failed
    }

    return trimmed;
  } catch (error) {
    console.error(`❌ Translation error for "${text.substring(0, 50)}...":`, error);
    return text; // Fall back to original on error
  }
}

/**
 * Batch translate multiple texts using Gondor
 * @param texts - Array of texts to translate
 * @param sourceLanguage - Source language
 * @param targetLanguage - Target language
 * @returns Array of translated texts in the same order
 */
export async function batchTranslateWithGondor(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  // Safety: preserve empty strings and return them as-is
  const nonEmptyTexts = texts.map((text, idx) => ({ 
    text, 
    idx, 
    isEmpty: !text || text.trim().length === 0 
  }));
  
  const textsToTranslate = nonEmptyTexts.filter(t => !t.isEmpty);

  // If all texts are empty, return as-is
  if (textsToTranslate.length === 0) {
    return texts;
  }

  // Translate texts sequentially - await ensures we wait for each response before next request
  const translatedResults: Array<{ idx: number; text: string }> = [];
  
  for (const item of textsToTranslate) {
    try {
      const translated = await translateWithGondor(item.text, sourceLanguage, targetLanguage);
      translatedResults.push({ idx: item.idx, text: translated });
    } catch (error) {
      console.error(`Translation error for text at index ${item.idx}:`, error);
      translatedResults.push({ idx: item.idx, text: item.text }); // Fall back to original
    }
  }

  // Reconstruct array with original empty strings in correct positions
  const resultArray: string[] = new Array(texts.length);
  let resultIdx = 0;
  
  for (const item of nonEmptyTexts) {
    if (item.isEmpty) {
      resultArray[item.idx] = item.text; // Preserve empty string
    } else {
      const translated = translatedResults[resultIdx];
      resultArray[item.idx] = translated.text;
      resultIdx++;
    }
  }

  return resultArray;
}

/**
 * Translate a structured object with multiple fields
 * Useful for translating product descriptions, attributes, etc.
 * @param obj - Object with string values to translate
 * @param sourceLanguage - Source language
 * @param targetLanguage - Target language
 * @returns Object with translated values
 */
export async function translateObjectWithGondor(
  obj: Record<string, string | string[]>,
  sourceLanguage: string,
  targetLanguage: string
): Promise<Record<string, string | string[]>> {
  // Flatten arrays and strings for translation
  const flatEntries: Array<[string, string, boolean]> = [];
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        flatEntries.push([`${key}[${idx}]`, item, true]);
      });
    } else if (typeof value === 'string') {
      flatEntries.push([key, value, false]);
    }
  }

  if (flatEntries.length === 0) {
    return obj;
  }

  // Translate all texts
  const textsToTranslate = flatEntries.map(([_, text]) => text);
  const translatedTexts = await batchTranslateWithGondor(textsToTranslate, sourceLanguage, targetLanguage);

  // Reconstruct the object with translations
  const translated: Record<string, string | string[]> = {};
  const arrays: Record<string, string[]> = {};

  for (let i = 0; i < flatEntries.length; i++) {
    const [key, _, isArray] = flatEntries[i];
    const translatedText = translatedTexts[i] || '';

    if (isArray) {
      const baseKey = key.match(/^([^\[]+)/)?.[1] || key;
      if (!arrays[baseKey]) {
        arrays[baseKey] = [];
      }
      arrays[baseKey].push(translatedText);
    } else {
      translated[key] = translatedText;
    }
  }

  // Merge arrays back into result
  for (const [key, values] of Object.entries(arrays)) {
    translated[key] = values;
  }

  return translated;
}
