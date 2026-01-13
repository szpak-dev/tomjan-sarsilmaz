import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";

export type Category = {
    id: string;
    lang: string;
    link: string;
    manufacturer: string;
    name: string;
    slug: string;
}

export async function findCategories(lang: string): Promise<Category[]> {
    const categories = await getCollection("categories");
    
    const result = categories
        .filter((c) => c.data.lang === lang)
        .map((c) => {
            const category = c.data as Category;
            category.link = getCategoryUrl(category, lang);
            return category;
        });

    return result;
}

export async function getCategoryBySlug(slug: string, lang: string): Promise<Category> {
    const categories = await findCategories(lang);
    const category = categories.find((category) => category.slug === slug);
        
    if (!category) {
        throw new Error(`Category with slug ${slug} not found`);
    }

    return category;
}

export function getCategoryUrl(category: Category, lang: string): string {
  return getRelativeLocaleUrl(lang, `/category/${category.slug}/`);
}
