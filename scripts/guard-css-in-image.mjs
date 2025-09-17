#!/usr/bin/env node

import { execSync } from 'child_process';

const imageId = process.argv[2];

if (!imageId) {
  console.error('❌ Usage: node guard-css-in-image.mjs <image-id>');
  process.exit(1);
}

console.log('🔍 Checking CSS files in image...');

try {
  // Create temporary container and extract CSS files
  const cid = execSync(`docker create ${imageId}`, { encoding: 'utf-8' }).trim();
  
  try {
    execSync(`docker cp ${cid}:/app/.next/static /tmp/next-static-check`, { stdio: 'ignore' });
    
    // Check if CSS files exist
    const cssFiles = execSync('find /tmp/next-static-check -name "*.css" -type f', { encoding: 'utf-8' });
    
    if (!cssFiles.trim()) {
      console.error('❌ No CSS files found in image');
      process.exit(1);
    }
    
    console.log('✅ CSS files found in image:');
    console.log(cssFiles.trim().split('\n').map(f => `   ${f}`).join('\n'));
    
  } finally {
    execSync(`docker rm -v ${cid}`, { stdio: 'ignore' });
  }
  
} catch (error) {
  console.error('❌ Failed to check CSS in image:', error.message);
  process.exit(1);
}

console.log('✅ CSS files are present in the image');
