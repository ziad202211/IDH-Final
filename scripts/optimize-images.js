const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Supported image formats
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  // Maximum width for resized images (maintains aspect ratio)
  MAX_WIDTH: 2000,
  // Quality for WebP conversion (1-100)
  WEBP_QUALITY: 80,
  // Quality for JPEG images (1-100)
  JPEG_QUALITY: 85,
  // Public directory path (relative to project root)
  PUBLIC_DIR: 'public',
  // Directories to ignore
  IGNORE_DIRS: ['.git', 'node_modules'],
};

// Ensure the script is running from the project root
process.chdir(path.join(__dirname, '..'));

/**
 * Optimize a single image file
 * @param {string} filePath - Path to the image file
 * @returns {Promise<void>}
 */
async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isWebP = ext === '.webp';
  
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Skip if already optimized or not an image we can process
    if (metadata.format === 'webp' || !CONFIG.SUPPORTED_EXTENSIONS.includes(ext)) {
      return;
    }
    
    console.log(`Optimizing: ${filePath}`);
    
    // Create WebP version
    const webpPath = `${filePath.substring(0, filePath.lastIndexOf('.'))}.webp`;
    
    // Resize if necessary and convert to WebP
    await image
      .resize({
        width: Math.min(metadata.width, CONFIG.MAX_WIDTH),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: CONFIG.WEBP_QUALITY })
      .toFile(webpPath);
    
    console.log(`Created WebP version: ${webpPath}`);
    
    // For JPEGs, also optimize the original
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: CONFIG.JPEG_QUALITY, mozjpeg: true })
        .toFile(filePath);
      console.log(`Optimized JPEG: ${filePath}`);
    }
    
    // For PNGs, optimize the original
    if (ext === '.png') {
      await image
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(filePath);
      console.log(`Optimized PNG: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error.message);
  }
}

/**
 * Process all images in a directory
 * @param {string} dir - Directory to process
 * @returns {Promise<void>}
 */
async function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      // Skip ignored directories
      if (stat.isDirectory()) {
        if (!CONFIG.IGNORE_DIRS.includes(file)) {
          await processDirectory(fullPath);
        }
        continue;
      }
      
      // Process image files
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.SUPORTED_EXTENSIONS.includes(ext)) {
        await optimizeImage(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

/**
 * Get only changed/added image files from git
 * @returns {string[]} Array of changed image file paths
 */
function getChangedImageFiles() {
  try {
    // Get changed files from git
    const changedFiles = execSync('git diff --name-only --diff-filter=ACMRTUXB')
      .toString()
      .split('\n')
      .filter(Boolean);
    
    return changedFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return CONFIG.SUPPORTED_EXTENSIONS.includes(ext);
    });
  } catch (error) {
    console.error('Error getting changed files from git:', error.message);
    return [];
  }
}

/**
 * Main function to run the optimization
 */
async function runOptimization() {
  console.log('Starting image optimization...');
  
  try {
    // Check if sharp is installed
    try {
      require.resolve('sharp');
    } catch (e) {
      console.log('Installing sharp...');
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    }
    
    // Get CLI arguments
    const args = process.argv.slice(2);
    const onlyChanged = args.includes('--changed');
    
    if (onlyChanged) {
      // Only process changed/added images
      const changedFiles = getChangedImageFiles();
      console.log(`Found ${changedFiles.length} changed image(s) to optimize`);
      
      for (const file of changedFiles) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
          await optimizeImage(fullPath);
        }
      }
    } else {
      // Process all images in public directory
      console.log('Processing all images in public directory...');
      await processDirectory(CONFIG.PUBLIC_DIR);
    }
    
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  }
}

// Run the optimization
runOptimization();
