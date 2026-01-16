import { useTranslations } from "../i18n/utils";
import type { ui } from "../i18n/ui";

export type AvailableLanguage = {
    code: string;
    label: string;
    flag: string;
}

export function getAvailableLanguages(): AvailableLanguage[] {
    const languages = [
        { code: 'en', label: 'EN', flag: '🇬🇧' },
        { code: 'pl', label: 'PL', flag: '🇵🇱' },
    ];

    return languages;
}

export function getLanguage(code: string): AvailableLanguage {
    const languages = getAvailableLanguages();
    const language = languages.find((lang) => lang.code === code);
    
    if (!language) {
        throw new Error(`Language with code ${code} not found`);
    }
    
    return language;
}

export function getDefaultLanguage(): AvailableLanguage {
    return { code: 'pl', label: 'PL', flag: '🇵🇱' };
}

export function getTranslator(lang: string) {
    const validLang = (lang === 'en' || lang === 'pl') ? lang : 'pl';
    return useTranslations(validLang as keyof typeof ui);
}

export type SocialLink = {
    name: string;
    url: string;
    icon: string;
    color?: string;
};

export function getSocialAccounts(): SocialLink[] {
    return [
        { name: "Facebook", url: "https://www.facebook.com/greyhunter", icon: "bi bi-facebook", color: "text-primary" },
        { name: "Instagram", url: "https://www.instagram.com/greyhunter", icon: "bi bi-instagram", color: "text-danger" },
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
    socials: SocialLink[];
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
        socials: getSocialAccounts(),
    };
}

export function getOwnerStory(manufacturerId: string, lang: string): string {
    const stories: Record<string, Record<string, string>> = {
        "sarsilmaz": {
            "en": "Sarsilmaz represents the modern face of Turkish firearms engineering. With decades of proven excellence, they've earned recognition worldwide for their reliability and innovative designs. Whether for hunting or sport shooting, Sarsilmaz firearms combine precision manufacturing with timeless quality. I partnered with them because they understand that a firearm must be dependable when it matters most.",
            "pl": "Sarsilmaz reprezentuje nowoczesne oblicze tureckiej inżynierii strzeleckiej. Dzięki dziesięcioleciom sprawdzonej doskonałości zdobyli uznanie na całym świecie za niezawodność i innowacyjne projekty. Niezależnie od tego, czy chodzi o łowiectwo czy sport strzelecki, karabiny Sarsilmaz łączą precyzyjną produkcję z ponadczasową jakością. Zawiązałem z nimi partnerstwo, ponieważ wiedzą, że broń musi być niezawodna, gdy to się liczy najbardziej."
        },
    };

    return stories[manufacturerId][lang];
}

export type ContentPage = {
    id: string;
    lang: string;
    title: string;
    slug: string;
    paragraphs: string[];
};

export function getContentPage(id: string, lang: string): ContentPage {
    const pages: ContentPage[] = [
        {
            id: "about-company",
            lang: "en",
            title: "About Company",
            slug: "about-company",
            paragraphs: [
                "Grey Hunter has been actively trading since 2013. From its inception, the company's main goal was to supply products to the Polish market dedicated to the hunting and shooting industries.",
                "Grey Hunter operates on a business-to-business model, representing international brands in the Polish market and building a sales network throughout the country. This type of agency activity ensures that our foreign partners not only have a distributor, but someone who cares about building their brand, reputation, and good standing among individual customers.",
                "We understand that building stable business relationships with shops in the Polish market requires time and effort. Therefore, through countless meetings, conversations, visits, and trade shows, we constantly strive to listen to our partners' needs and meet their expectations, making their business operations easier.",
                "As a company providing trade mediation and brand representation services, we are aware that our future is the future of the hunting and shooting industries in Poland. We thank all our current business partners for their trust and invite new Polish entrepreneurs interested in our offer to cooperate with us.",
            ],
        },
        {
            id: "about-company",
            lang: "pl",
            title: "O Firmie",
            slug: "o-firmie",
            paragraphs: [
                "Firma Grey Hunter działa aktywnie w handlu od 2013 roku. Od momentu założenia głównym celem przedsiębiorstwa było dostarczanie na rynek polski produktów adresowanych dla branży myśliwskiej i strzeleckiej.",
                "Grey Hunter prowadzi działalność w oparciu o model business 2 business, reprezentując marki zagraniczne na rynku polskim, oraz budując sieć sprzedaży na terenie całego kraju.Tego typu działalność agencyjna sprawia, że nasi zagraniczni kontrahenci nie tylko posiadają dystrybutora, ale kogoś, kto dba o budowanie ich marki, wizerunku oraz o dobre imię wśród klientów indywidualnych.",
                "Mamy świadomość, że budowanie stabilnych relacji handlowych ze sklepami na rynku polskim wymaga czasu i pracy. Dlatego podczas niezliczonej ilości spotkań, rozmów, wizyt i targów każdorazowo staramy się słuchać potrzeb naszych partnerów i spełniać ich oczekiwania, ułatwiając im prowadzenie działalności.",
                "Jako firma świadcząca usługi pośrednictwa handlu i reprezentowania marki, zdajemy sobie sprawę, że nasza przyszłość to przyszłość branży myśliwskiej i strzeleckiej w Polsce.Dziękujemy za zaufanie wszystkim dotychczasowym partnerom handlowym i zapraszamy do współpracy nowych polskich przedsiębiorców zainteresowanych naszą ofertą.",
             ],
        },
        {
            id: "contact",
            lang: "en",
            title: "Contact",
            slug: "contact",
            paragraphs: [
                "Get in touch. I'm here to help and answer any questions you might have."
            ],
        },
        {
            id: "contact",
            lang: "pl",
            title: "Kontakt",
            slug: "kontakt",
            paragraphs: [
                "Skontaktuj się ze mną. Jestem tutaj, aby pomóc i odpowiedzieć na wszelkie pytania, które możesz mieć."
            ],
        },
    ];

    const page = pages.find((p) => p.id === id && p.lang === lang);
    
    if (!page) {
        throw new Error(`Content page with id '${id}' not found for lang '${lang}'`);
    }

    return page;
}

export type NavigationItem = {
    id: string;
    slug: string;
    name: string;
    path: string;
    icon?: string;
};

export function getNavigationItems(lang: string): NavigationItem[] {
    return [];
}

export function getAllNavigationItems(): Record<string, NavigationItem[]> {
    return {};
}