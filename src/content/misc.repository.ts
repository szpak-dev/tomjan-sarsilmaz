export type SocialAccount = {
    name: string;
    url: string;
    icon: string;
};

export function findSocialAccounts(): SocialAccount[] {
    return [
        { name: "Facebook", url: "https://www.facebook.com/greyhunter", icon: "bi bi-facebook", },
        { name: "Instagram", url: "https://www.instagram.com/greyhunter", icon: "bi bi-instagram", },
    ];
}

export type SiteOwner = {
    name: string;
    company: {
        name: string;
        taxId: string; // nip
        registrationId: string; // regon
    };
    address: {
        street: string;
        postalCode: string;
        city: string;
        country: string;
    };
    contact: {
        email: string;
        phone: {
            number: string;
            url: string;
        };
        website: string;
    };
};

export function getSiteOwner(): SiteOwner {
    return {
        name: "Tomasz Jantos",
        company: {
            name: "Grey Hunter Tomasz Jantos",
            taxId: "9512111440",
            registrationId: "146876673",
        },
        address: {
            street: "Belgradzka 18/108",
            postalCode: "02-793",
            city: "Warszawa",
            country: "Polska",
        },
        contact: {
            email: "tomek.jantos@greyhunter.com.pl",
            phone: {
                number: "+48 502 770 556",
                url: "tel:+48502770556",
            },
            website: "https://greyhunter.com.pl",
        },
    };
}

export function findSliderItems(manufacturer: string): { image: string; altText: string; }[] {
    const mapping: Record<string, { image: string; altText: string; }[]> = {
        "sarsilmaz": [
            { image: "sarsilmaz.pl/slider-0", altText: "Slider Item 0", },
            { image: "sarsilmaz.pl/slider-1", altText: "Slider Item 1", },
            { image: "sarsilmaz.pl/slider-2", altText: "Slider Item 2", },
            { image: "sarsilmaz.pl/slider-3", altText: "Slider Item 3", },
        ],
    }

    return mapping[manufacturer] || [];
}