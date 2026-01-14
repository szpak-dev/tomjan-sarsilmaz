export type Manufacturer = {
    name: string;
    slug: string;
    logoUrl: string;
    socials: { name: string; url: string; icon: string }[];
};

const data = [
    {
        name: "Sarsilmaz",
        slug: "sarsilmaz",
        logoUrl: "greyhunter.com.pl/sarsilmaz_logo_blue.webp",
        socials: [
            { 
                name: "Sarsilmaz Polska", 
                url: "https://www.facebook.com/sarsilmaz.polska", 
                icon: "bi bi-facebook", 
            },
        ],
    },
]

export function find(): Manufacturer[] {
    return data
}

export function get(slug: string): Manufacturer {
    const manufacturer = data.find(manufacturer => manufacturer.slug === slug);
    
    if (!manufacturer) {
        throw new Error(`Manufacturer with slug "${slug}" not found.`);
    }
    
    return manufacturer;
}
