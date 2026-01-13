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
