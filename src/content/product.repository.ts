import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";

export type Attribute = {
    id: string;
    name: string;
    value: string;
}

export type AttributeGroup = {
    id: string;
    name: string;
    properties: Attribute[];
}

export type Variant = {
    id: string;
    name: string;
    value: string;
}

export type ExtraValue = {
    id: string;
    name: string;
    value: string;
}

export type Product = {
    id: string;
    lang: string;
    link: string;
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
    attribute_groups: AttributeGroup[];
    variants: Variant[];
    extra_data: ExtraValue[];
    images: string[];
}

export async function findProducts(manufacturer: string, lang: string): Promise<Product[]> {
    const products = await getCollection("products");
    const filtered = products.filter((p) => p.data.lang === lang && p.data.manufacturer === manufacturer);
    filtered.sort((a, b) => a.data.name.localeCompare(b.data.name));

    return filtered.map((p) => {
        const product = p.data as Product;
        product.link = getProductUrl(product, lang);
        return product;
    });
}

export async function findCategoryProducts(manufacturer: string, category_slug: string, lang: string): Promise<Product[]> {
    const products = await findProducts(manufacturer, lang);
    return products.filter((p) => p.category_slug === category_slug);
}

export async function getFirstCategoryProduct(manufacturer: string, category_slug: string, lang: string): Promise<Product> {
    const products = await findCategoryProducts(manufacturer, category_slug, lang);

    if (products.length === 0) {
        throw new Error(`No products found for category ${category_slug}`);
    }
    
    return products[0];
}

export async function getProductBySlug(manufacturer: string, slug: string, lang: string): Promise<Product> {
    const products = await findProducts(manufacturer, lang);
    const product = products.find((product) => product.slug === slug);

    if (!product) {
        throw new Error(`Product with slug ${slug} not found`);
    }

    return product;
}

export function getProductUrl(product: Product, lang: string): string {
    return getRelativeLocaleUrl(lang, `/${product.slug}/`);
}
