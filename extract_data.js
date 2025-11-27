
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDir = path.join(__dirname, 'src/content/products');

async function processFiles() {
    try {
        const files = fs.readdirSync(productsDir);
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        for (const htmlFile of htmlFiles) {
            const baseName = path.basename(htmlFile, '.html');
            const jsonFile = `${baseName}.json`;
            const jsonPath = path.join(productsDir, jsonFile);

            if (fs.existsSync(jsonPath)) {
                console.log(`Processing ${htmlFile}...`);
                const htmlPath = path.join(productsDir, htmlFile);
                const htmlContent = fs.readFileSync(htmlPath, 'utf8');
                const $ = cheerio.load(htmlContent);

                // Extract Lead
                const lead = $('.product-info p').text().trim();

                // Extract Description
                const description = $('#Urun-Hakkinda p').text().trim();

                // Extract Specification
                const specification = [];
                $('.feature-box-content').each((i, el) => {
                    const value = $(el).find('span span').text().trim();
                    const name = $(el).find('span.fs-15').contents().filter((i, node) => node.nodeType === 3).text().trim();
                    if (name && value) {
                        specification.push({ name, value });
                    }
                });

                // Extract Features
                const features = [];
                const ozellikler = $('#Ozellikler');
                const siblingContainer = ozellikler.next('.container');

                if (siblingContainer.length > 0) {
                    let currentCategory = null;

                    // We need to iterate over rows that are direct children or wrapped in a way that we can identify them
                    // Based on inspection, we look for rows inside the container
                    const rows = siblingContainer.find('.row');

                    rows.each((i, row) => {
                        // Check if this row is a parent of other rows - if so, skip it or handle differently
                        // The structure seems to be flat rows for categories and items
                        // But let's be careful not to double count if there are nested rows
                        if ($(row).find('.row').length > 0) return;

                        const cols = $(row).children();

                        // Category row usually has one col-12
                        if (cols.length === 1 && cols.hasClass('col-12')) {
                            // It might be a wrapper for the category title row?
                            // In the inspection output: 
                            // <div class="row bg-very-light-gray"> <div class="col-lg-12 ...">DIMENSIONS</div> </div>
                            // So the row has 1 col.
                            const text = $(row).text().trim();
                            if (text) {
                                currentCategory = { name: text, items: [] };
                                features.push(currentCategory);
                            }
                        } else if (cols.length === 1 && $(row).find('.col-lg-12').length > 0) {
                            // Another check for category
                            const text = $(row).text().trim();
                            if (text) {
                                currentCategory = { name: text, items: [] };
                                features.push(currentCategory);
                            }
                        }
                        // Item row usually has 2 cols (name and value)
                        else if (cols.length >= 2) {
                            // In inspection: 
                            // <div class="col-lg-4 ...">1 Overall Length</div> <div class="col-lg-8 ...">190 mm</div>
                            const nameEl = cols.eq(0);
                            const valueEl = cols.eq(1);

                            // Clean up name (remove numbering if present, e.g. "1  Overall Length")
                            let name = nameEl.text().trim();
                            // Remove leading numbers and whitespace
                            name = name.replace(/^\d+\s+/, '');

                            const value = valueEl.text().trim();

                            if (currentCategory && name && value) {
                                currentCategory.items.push({ name, value });
                            }
                        }
                    });
                }

                // Update JSON
                const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                jsonContent.lead = lead;
                jsonContent.description = description;
                jsonContent.specification = specification;
                jsonContent.features = features;

                fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
                console.log(`Updated ${jsonFile}`);
            } else {
                console.log(`Skipping ${htmlFile} (no corresponding JSON)`);
            }
        }
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
    }
}

processFiles();
