import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { productRepository } from ".";
import { VISIBLE_CATEGORIES } from "./filters.config";

export type Category = {
    id: string;
    lang: string;
    link: string;
    manufacturer: string;
    name: string;
    slug: string;
    image: string;
}

export async function findCategories(lang: string): Promise<Category[]> {
    const collectionCategories = await getCollection("categories");

    const categories = collectionCategories
        .map((c) => c.data as Category)
        .filter((category) => category.lang === lang)
        .filter((category) => {
            const visibleSlugs = VISIBLE_CATEGORIES[category.manufacturer];
            return visibleSlugs ? visibleSlugs.includes(category.slug) : true;
        });

    categories.forEach(async (category) => {
        const { manufacturer, slug } = category;

        try {
            const product = await productRepository.getFirstCategoryProduct(manufacturer, slug, lang);
            category.image = product.images.length > 0 ? product.images[0] : "";
        } catch (error) {
            console.warn(`No products found for category ${category.slug}`);
            category.image = "";
        }
    });

    return categories.map((category) => {
        category.link = getCategoryUrl(category, lang);
        return category;
    });
}

export async function findManufacturerCategories(manufacturer: string, lang: string): Promise<Category[]> {
    const categories = await findCategories(lang);
    return categories.filter((category) => category.manufacturer === manufacturer);
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
