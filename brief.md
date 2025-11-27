# sarsilmaz.pl website

Sarsilmaz is a turkish company that sells pistols. Greyhunter is a nickname of the importer who imports weapons and sells them in Poland.
The website should be similar to greyhunter.com.pl (which I also did) but simplified. But simplified doesn't mean looking worse, you can try
to make it look better but still using BS 5.3.

## Technologies
- static website with html, css, js
- astro framework with typescript
- bootstrap 5.3
- cloudinary as images cdn

## Sections
Main page:
- header:
    - strip with links to social media
    - logo of greyhunter
    - no navigation
- content:
    - slider with some pictures (tbd, for now use placeholders)
    - products grid with 3 columns where each product card has:
        - image
        - name
    - each product card is a link to product page
- product page:
    - image
    - name
    - description
    - specification table

## Data structure for products
Since we use astro framework, we need to create data for products in json format:

```json
{
    "products": [
        {
            "id": "1",
            "catalogNumber": "12345",
            "name": "Product 1",
            "lead": "Lead text for product 1",
            "description": "Description of product 1",
            "images": ["image1.jpg", "image2.jpg"],
            "specification": [
                {"name": "Caliber", "value": "value"},
                {"name": "Trigger Pull", "value": "value"},
                {"name": "Weight", "value": "value"},
                {"name": "Barrel Length", "value": "value"},
                {"name": "Operating Principle", "value": "value"},
                {"name": "Bullets Capacity", "value": "value"},
                {"name": "Slide Width", "value": "value"},
                {"name": "Muzzle Velocity", "value": "value"},
                {"name": "Safety System", "value": "value"},
            ],
            "features": [
                {"category": "Dimensions", "parameters": [
                    {"name": "Overall Length", "value": "value"},
                    {"name": "Height", "value": "value"},
                    {"name": "Overall Width", "value": "value"},
                    {"name": "Slide Width", "value": "value"},
                    {"name": "Slide Height", "value": "value"},
                    {"name": "Sight Radius", "value": "value"},
                    {"name": "Trigger Distance", "value": "value"},
                ]},
                {"category": "Weights", "parameters": [
                    {"name": "Without Magazine", "value": "value"},
                    {"name": "With Empty Magazine", "value": "value"},
                    {"name": "With Loaded Magazine", "value": "value"},
                ]},
                {"category": "Product", "parameters": [
                    "Value 1",
                    "Value 2",
                    "Value 3",
                ]},
            ],
        }
    ]
}
```

The same data will be used to present products grid on main page.

## Particular products to scrape from www.sarsilmaz.com
Here is a list with catalog number, some of them are missng so you need to find them on the website.

Products:
- 401339: SARSILMAZ SAR9 GEN3 BLACK 9x19mm Semi Automatic Pistol
- 401346: SARSILMAZ SAR9 GEN3 PLATINUM 9x19mm Semi Automatic Pistol
- 401338: SARSILMAZ SAR9C GEN3 BLACKv9x19mm Semi Automatic Pistol
- 401343: SARSILMAZ SAR9C GEN3 PLATINUM 9x19mm Semi Automatic Pistol
- ??????: SARSILMAZ SAR9 SC GEN3 BLACK 9x19mm Semi Automatic Pistol
- ??????: SARSILMAZ SAR9 SC GEN3 OD GREEN 9x19mm Semi Automatic Pistol
- 400946: SARSILMAZ SAR9 SP KHAKI 9x19mm Semi Automatic Pistol
- ??????: SARSILMAZ SAR9 SP BLACK 9x19mm Semi Automatic Pistol
- 401340: SARSILMAZ SAR9 SPORT GEN3 BLACK 9x19mm Semi Automatic Pistol
- 401349: SARSILMAZ SAR9 SPORT GEN3 PLATINUM 9x19mm Semi Automatic Pistol
- 400613: SARSILMAZ K12 SPORT 9x19mm Semi Automatic Pistol
- 400698: SARSILMAZ K12 SPORT X 9x19mm Semi Automatic Pistol
- 400038: SARSILMAZ P 8 L BLACK 9x19mm Semi Automatic Pistol
- 400474: SARSILMAZ P 8 L STAINLESS STEEL 9x19mm Semi Automatic Pistol
- 400041: SARSILMAZ P 8 S BLACK 9x19mm Semi Automatic Pistol
- 400476: SARSILMAZ P 8 S STAINLESS STEEL 9x19mm Semi Automatic Pistol
