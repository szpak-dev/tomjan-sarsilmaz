import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagesDir = path.join(__dirname, 'public/img');
const cloudinaryFolder = 'sarsilmaz.pl';

async function uploadImages() {
    try {
        // Check if directory exists
        if (!fs.existsSync(imagesDir)) {
            console.error(`Directory ${imagesDir} does not exist`);
            return;
        }

        // Read all files from the directory
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });

        console.log(`Found ${imageFiles.length} images to upload`);

        let uploaded = 0;
        let failed = 0;

        for (const file of imageFiles) {
            const filePath = path.join(imagesDir, file);
            const fileName = path.parse(file).name; // Get filename without extension

            try {
                console.log(`Uploading ${file}...`);

                const result = await cloudinary.uploader.upload(filePath, {
                    folder: cloudinaryFolder,
                    public_id: fileName,
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true
                });

                console.log(`✓ Uploaded: ${file} -> ${result.secure_url}`);
                uploaded++;
            } catch (error) {
                console.error(`✗ Failed to upload ${file}:`, error.message);
                failed++;
            }
        }

        console.log(`\n=== Upload Summary ===`);
        console.log(`Total: ${imageFiles.length}`);
        console.log(`Uploaded: ${uploaded}`);
        console.log(`Failed: ${failed}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

uploadImages();
