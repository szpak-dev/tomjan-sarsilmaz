import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { translationRepository } from ".";
import slugify from "slugify"

export type SpecificationItem = {
    id: string;
    name: string;
    value: string | string[];
}

export type FeatureParameter = {
    id: string;
    name: string;
    value: string;
}

export type Feature = {
    id: string;
    category: string;
    parameters: FeatureParameter[];
}

export type Product = {
    id: string;
    lang: string;
    link: string;
    catalogNumber: string;
    name: string;
    shortName: string;
    active: boolean;
    featured?: boolean;
    color?: string;
    lead?: string;
    description?: string;
    images: string[];
    specification: SpecificationItem[];
    features: Feature[];
}

export async function findProducts(lang: string): Promise<Product[]> {
    const products = await getCollection("products");
    
    return products.map((p) => {
        const product = p.data as Product;
        product.link = getProductUrl(product, lang);
        product.images = product.images.map((imageUrl) => `sarsilmaz.pl/${imageUrl}`);
        return product;
    }).filter((product) => product.lang === lang && product.active);
}

export async function getProductById(id: string, lang: string): Promise<Product> {
    const products = await findProducts(lang);
    const product = products.find((product) => product.id === id && product.lang === lang);
        
    if (!product) {
        throw new Error(`Product with id ${id} not found`);
    }

    return product;
}

export function getProductUrl(product: Product, lang: string): string {
  return getRelativeLocaleUrl(lang, `/${product.id}/`);
}

export function translateProduct(product: Product, lang: string): Product {
    const t = translationRepository.getTranslator(lang);

    product.specification = product.specification.map((spec) => {
        let value = spec.value;

        if (Array.isArray(value)) {
            value = value.map((v) => t(`spec.${v}` as any) || v).join(", ");
        }

        return {
            id: slugify(spec.name),
            name: t(`spec.${spec.name}` as any) || spec.name,
            value,
        };
    });

    product.features = product.features.map((feature) => {
        const parameters = feature.parameters.map((param) => {
            if (typeof param === 'string') {
                return param;
            } else if (Array.isArray(param)) {
                return param.map((p) => t(`param.${p}` as any) || p).join(", ");
            } else {
                return {
                    id: slugify(param.name),
                    name: t(`param.${param.name}` as any) || param.name,
                    value: t(`param.${param.value}` as any) || param.value,
                };
            }
        });

        return {
            id: slugify(feature.category),
            category: t(`category.${feature.category}` as any) || feature.category,
            parameters,
        };
    });

    return product;
}