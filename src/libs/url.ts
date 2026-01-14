import { getRelativeLocaleUrl } from "astro:i18n";
import { getBasePath } from "./deployment";

/**
 * Creates a URL for the given locale and path, accounting for base path and locale prefix.
 * This function extracts the current path without base path and locale prefix,
 * then reconstructs the URL with the new locale.
 * 
 * @param currentPathname - The current pathname from Astro.url.pathname
 * @param currentLocale - The current locale from Astro.currentLocale
 * @param targetLocale - The target locale code
 * @param targetPath - Optional specific path to navigate to (without locale prefix)
 * @returns The full URL with base path and locale prefix
 */
export function getLocaleUrl(
  currentPathname: string,
  currentLocale: string,
  targetLocale: string,
  targetPath?: string
): string {
  const basePath = getBasePath();
  
  // Remove base path from current pathname
  let currentPath = currentPathname.startsWith(basePath) 
    ? currentPathname.slice(basePath.length)
    : currentPathname;

  // Remove locale prefix from current path
  const localePrefix = `/${currentLocale}/`;
  currentPath = currentPath.startsWith(localePrefix)
    ? currentPath.slice(localePrefix.length)
    : currentPath;

  // Use provided target path or current path
  const pathToUse = targetPath !== undefined ? targetPath : currentPath;
  
  // Get the relative locale URL (this already includes base path)
  return getRelativeLocaleUrl(targetLocale, pathToUse);
}

/**
 * Creates a locale URL using Astro context.
 * 
 * @param astroContext - Object containing url, currentLocale, and params from Astro
 * @param options - Configuration object with optional targetLocale and path
 * @returns The full URL with base path and locale prefix
 */
export function makeUrl(
  astroContext: { url: URL; currentLocale: string | undefined; params?: { lang?: string } },
  options: { targetLocale?: string; path?: string } = {}
): string {
  const { targetLocale, path } = options;
  const locale = targetLocale || (astroContext.params?.lang as string | undefined);

  if (!locale) {
    throw new Error("Target locale must be provided or available in Astro.params.lang");
  }

  return getLocaleUrl(
    astroContext.url.pathname,
    astroContext.currentLocale as string,
    locale,
    path
  );
}
