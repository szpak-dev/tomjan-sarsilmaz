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

export async function findProducts(lang: string): Promise<Product[]> {
    const products = await getCollection("products");
    
    const filtered = products.filter((p) => p.data.lang === lang);
    
    return filtered.map((p) => {
        const product = p.data as Product;
        product.link = getProductUrl(product, lang);
        return product;
    });
}

export async function getProductBySlug(slug: string, lang: string): Promise<Product> {
    const products = await findProducts(lang);
    const product = products.find((product) => product.slug === slug);
        
    if (!product) {
        throw new Error(`Product with slug ${slug} not found`);
    }

    return product;
}

export async function findFeatured(lang: string): Promise<Product[]> {
    const products = await findProducts(lang);
    const featuredSlugs = ["k2-45c-stainless-steel", "sar-7-24-sport-platinum", "sar9-safari"];
    
    return products.filter(product => featuredSlugs.includes(product.slug));
}

export function getProductUrl(product: Product, lang: string): string {
  return getRelativeLocaleUrl(lang, `/${product.slug}/`);
}
