import { getCollection } from 'astro:content';

export type SocialLink = {
    label: string;
    url: string;
    icon: string;
}

export type ManufacturerLink = {
    url: string;
    target: string; // '_self' for internal links, '_blank' for external
}

export type Manufacturer = {
    id: string;
    lang: string;
    name: string;
    logoImage: string;
    website: string;
    link: ManufacturerLink;
    socials: SocialLink[];
    description: string[];
    domains: string[];
    imageOrientation: "portrait" | "landscape";
}

export async function findAll(lang: string): Promise<Manufacturer[]> {
    const manufacturers = await getCollection('manufacturers');
    return manufacturers
        .map((entry) => entry.data as Manufacturer)
        .filter((manufacturer) => manufacturer.lang === lang);
}

export async function get(id: string, lang: string): Promise<Manufacturer> {
    const manufacturers = await findAll(lang);
    const manufacturer = manufacturers.find((m) => m.id === id);

    if (!manufacturer) {
        throw new Error(`Manufacturer with id '${id}' not found for lang '${lang}'`);
    }

    return manufacturer;
}
