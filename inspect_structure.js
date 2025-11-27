
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const filePath = '/Users/gorky/Sites/tomjan-sarsilmaz/src/content/products/p-8-s-black.html';
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);

console.log('--- Lead ---');
console.log($('.product-info p').text().trim());

console.log('\n--- Description ---');
console.log($('#Urun-Hakkinda p').text().trim());

console.log('\n--- Specification ---');
$('.feature-box-content').each((i, el) => {
    const value = $(el).find('span span').text().trim();
    // Name is the text node after the <br> inside the outer span
    // Structure: <div class="feature-box-content"> <span class="fs-15"> <span ...>Value</span> <br> Name </span> </div>
    const name = $(el).find('span.fs-15').contents().filter((i, node) => node.nodeType === 3).text().trim();
    console.log(`Spec ${i}: ${name} = ${value}`);
});

console.log('\n--- Features ---');
// User said: #Ozellikler has a sibling with .container class
// Let's check siblings
const ozellikler = $('#Ozellikler');
console.log('#Ozellikler length:', ozellikler.length);
console.log('#Ozellikler next element class:', ozellikler.next().attr('class'));
console.log('#Ozellikler parent class:', ozellikler.parent().attr('class'));

// Check if content is inside #Ozellikler
console.log('#Ozellikler children count:', ozellikler.children().length);
ozellikler.find('.row').each((i, row) => {
    // console.log(`Row ${i}:`, $(row).text().trim().substring(0, 50));
});

// Check rows inside #Ozellikler
console.log('--- Rows inside #Ozellikler ---');
ozellikler.find('.row').each((i, row) => {
    // Only print top level rows relative to #Ozellikler?
    // No, find() is recursive.
    // Let's check direct children rows
});
const directRows = ozellikler.children('.row');
console.log('Direct rows inside #Ozellikler:', directRows.length);

// Check sibling container
const siblingContainer = ozellikler.next('.container');
console.log('Sibling container length:', siblingContainer.length);
if (siblingContainer.length > 0) {
    const siblingRows = siblingContainer.find('.row');
    console.log('Rows inside sibling container:', siblingRows.length);
    siblingContainer.children('.row').each((i, row) => {
        console.log(`Sibling Row ${i} text:`, $(row).text().trim().substring(0, 100));
    });
}

// Let's look at the structure inside the first row of #Ozellikler
if (directRows.length > 0) {
    console.log('Analyzing first direct row of #Ozellikler...');
    const col = directRows.first().find('.col-12');
    console.log('Col-12 count:', col.length);
    col.children('.row').each((i, row) => {
        const text = $(row).text().trim().replace(/\s+/g, ' ');
        console.log(`Inner Row ${i}: ${text.substring(0, 100)}`);
    });
}

