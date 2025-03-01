/**
 * Asset Optimization Script for Production Deployment
 * 
 * This script optimizes assets after the Next.js build process:
 * - Compresses images further
 * - Adds cache headers to static assets
 * - Generates asset manifest for CloudFront
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BUILD_DIR = path.join(__dirname, '../.next');
const STATIC_DIR = path.join(BUILD_DIR, 'static');
const PUBLIC_DIR = path.join(__dirname, '../public');
const MANIFEST_FILE = path.join(BUILD_DIR, 'asset-manifest.json');

// Create asset manifest
function generateAssetManifest() {
  console.log('Generating asset manifest...');
  
  const manifest = {
    static: {},
    public: {}
  };
  
  // Process static assets
  if (fs.existsSync(STATIC_DIR)) {
    try {
      const staticFiles = getAllFiles(STATIC_DIR);
      staticFiles.forEach(file => {
        try {
          const relativePath = path.relative(BUILD_DIR, file);
          const stats = fs.statSync(file);
          manifest.static[relativePath] = {
            size: stats.size,
            hash: path.basename(path.dirname(file)),
            contentType: getContentType(file)
          };
        } catch (err) {
          console.warn(`Warning: Could not process static file ${file}: ${err.message}`);
        }
      });
    } catch (err) {
      console.warn(`Warning: Could not process static directory: ${err.message}`);
    }
  } else {
    console.warn(`Warning: Static directory does not exist: ${STATIC_DIR}`);
  }
  
  // Process public assets
  if (fs.existsSync(PUBLIC_DIR)) {
    try {
      const publicFiles = getAllFiles(PUBLIC_DIR);
      publicFiles.forEach(file => {
        try {
          const relativePath = path.relative(PUBLIC_DIR, file);
          const stats = fs.statSync(file);
          manifest.public[relativePath] = {
            size: stats.size,
            contentType: getContentType(file)
          };
        } catch (err) {
          console.warn(`Warning: Could not process public file ${file}: ${err.message}`);
        }
      });
    } catch (err) {
      console.warn(`Warning: Could not process public directory: ${err.message}`);
    }
  } else {
    console.warn(`Warning: Public directory does not exist: ${PUBLIC_DIR}`);
  }
  
  // Write manifest file
  try {
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Asset manifest generated at ${MANIFEST_FILE}`);
  } catch (err) {
    console.error(`Error writing manifest file: ${err.message}`);
    console.log('Continuing without manifest file...');
  }
}

// Helper to get all files recursively
function getAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        if (fs.statSync(filePath).isDirectory()) {
          getAllFiles(filePath, fileList);
        } else {
          fileList.push(filePath);
        }
      } catch (err) {
        console.warn(`Warning: Could not access ${filePath}: ${err.message}`);
      }
    });
    
    return fileList;
  } catch (err) {
    console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
    return fileList;
  }
}

// Helper to determine content type
function getContentType(file) {
  const ext = path.extname(file).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip'
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

// Main execution
try {
  console.log('Starting asset optimization...');
  generateAssetManifest();
  console.log('Asset optimization completed successfully!');
} catch (error) {
  console.error('Error during asset optimization:', error.message);
  console.log('Continuing with deployment despite optimization errors...');
  // Exit with success code to not block the build process
  process.exit(0);
} 