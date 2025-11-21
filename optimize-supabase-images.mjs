
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sourceBucket = 'images'; // The bucket with your original 4K images
const destinationBucket = 'optimized-images'; // A new bucket for optimized images
const maxImageWidth = 1920; // Max width for resizing
const quality = 80; // Quality setting for WebP

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or service key not provided in .env.local');
}

// --- Image Optimizer ---
class ImageOptimizer {
  async optimize(imageBuffer) {
    try {
      return await sharp(imageBuffer)
        .resize({
          width: maxImageWidth,
          withoutEnlargement: true, // Don't enlarge images smaller than max width
        })
        .webp({ quality })
        .toBuffer();
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw error;
    }
  }
}

// --- Storage Service (Supabase Implementation) ---
class SupabaseStorage {
  constructor() {
    this.client = createClient(supabaseUrl, supabaseServiceKey);
  }

  async listFiles(bucket) {
    const { data, error } = await this.client.storage.from(bucket).list();
    if (error) {
      console.error(`Error listing files in bucket "${bucket}":`, error);
      throw error;
    }
    return data.map(file => file.name);
  }

  async downloadFile(bucket, fileName) {
    const { data, error } = await this.client.storage.from(bucket).download(fileName);
    if (error) {
      console.error(`Error downloading file "${fileName}" from bucket "${bucket}":`, error);
      throw error;
    }
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async uploadFile(bucket, fileName, fileBuffer) {
    // Change the extension to .webp
    const newFileName = `${path.parse(fileName).name}.webp`;
    
    const { error } = await this.client.storage
      .from(bucket)
      .upload(newFileName, fileBuffer, {
        contentType: 'image/webp',
        upsert: true, // Overwrite if file already exists
      });

    if (error) {
      console.error(`Error uploading file "${newFileName}" to bucket "${bucket}":`, error);
      throw error;
    }
    console.log(`Successfully uploaded "${newFileName}" to "${bucket}".`);
  }
}

// --- Main Execution ---
async function run() {
  console.log('Starting image optimization process...');

  const storage = new SupabaseStorage();
  const optimizer = new ImageOptimizer();

  try {
    // 1. Ensure the destination bucket exists
    const { data: buckets, error } = await storage.client.storage.listBuckets();
    if (error) throw error;
    if (!buckets.find(b => b.name === destinationBucket)) {
      console.log(`Destination bucket "${destinationBucket}" not found. Creating it...`);
      const { error: createError } = await storage.client.storage.createBucket(destinationBucket, { public: true });
      if (createError) throw createError;
    }

    // 2. Get list of images from the source bucket
    const imageNames = await storage.listFiles(sourceBucket);
    console.log(`Found ${imageNames.length} images to process.`);

    // 3. Process each image
    for (const imageName of imageNames) {
      console.log(`Processing ${imageName}...`);
      try {
        // Download
        const imageBuffer = await storage.downloadFile(sourceBucket, imageName);
        
        // Optimize
        const optimizedBuffer = await optimizer.optimize(imageBuffer);
        
        // Upload
        await storage.uploadFile(destinationBucket, imageName, optimizedBuffer);

      } catch (err) {
        console.error(`Failed to process ${imageName}. Skipping.`, err);
      }
    }

    console.log('Image optimization process completed successfully!');

  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

run();
