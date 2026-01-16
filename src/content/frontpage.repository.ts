export function getSliderItems(manufacturer: string): { image: string; altText: string; }[] {
    const mapping: Record<string, { image: string; altText: string; }[]> = {
        "sarsilmaz": [
            { image: "sarsilmaz.pl/slider-0", altText: "Slider Item 0", },
            { image: "sarsilmaz.pl/slider-1", altText: "Slider Item 1", },
            { image: "https://res.cloudinary.com/dcpogr7md/image/upload/b_rgb:000000,c_lpad,g_center,h_675,w_1200/v1737000000/sarsilmaz.pl/slider-2.jpg", altText: "Slider Item 2", },
            { image: "sarsilmaz.pl/slider-3", altText: "Slider Item 3", },
        ],
    }

    return mapping[manufacturer] || [];
}