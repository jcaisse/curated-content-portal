#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';

console.log('🔍 Checking Tailwind CSS configuration...');

let hasErrors = false;

// Check if globals.css exists and has Tailwind directives
const globalsCssPaths = ['src/app/globals.css', 'app/globals.css'];
let globalsCssPath = null;

for (const path of globalsCssPaths) {
  if (existsSync(path)) {
    globalsCssPath = path;
    break;
  }
}

if (!globalsCssPath) {
  console.error('❌ No globals.css found in src/app/ or app/');
  hasErrors = true;
} else {
  console.log(`✅ Found globals.css: ${globalsCssPath}`);
  
  const cssContent = readFileSync(globalsCssPath, 'utf-8');
  const requiredDirectives = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
  
  for (const directive of requiredDirectives) {
    if (!cssContent.includes(directive)) {
      console.error(`❌ Missing Tailwind directive: ${directive}`);
      hasErrors = true;
    } else {
      console.log(`✅ Found directive: ${directive}`);
    }
  }
}

// Check if layout imports globals.css
const layoutPaths = ['src/app/layout.tsx', 'app/layout.tsx'];
let layoutPath = null;

for (const path of layoutPaths) {
  if (existsSync(path)) {
    layoutPath = path;
    break;
  }
}

if (!layoutPath) {
  console.error('❌ No layout.tsx found in src/app/ or app/');
  hasErrors = true;
} else {
  console.log(`✅ Found layout.tsx: ${layoutPath}`);
  
  const layoutContent = readFileSync(layoutPath, 'utf-8');
  if (!layoutContent.includes("import './globals.css'") && !layoutContent.includes('import "./globals.css"')) {
    console.error('❌ Layout does not import globals.css');
    hasErrors = true;
  } else {
    console.log('✅ Layout imports globals.css');
  }
}

// Check Tailwind config
if (!existsSync('tailwind.config.ts') && !existsSync('tailwind.config.js')) {
  console.error('❌ No tailwind.config.* found');
  hasErrors = true;
} else {
  console.log('✅ Found tailwind.config.*');
  
  const configPath = existsSync('tailwind.config.ts') ? 'tailwind.config.ts' : 'tailwind.config.js';
  const configContent = readFileSync(configPath, 'utf-8');
  
  if (!configContent.includes('content:') && !configContent.includes('content:')) {
    console.error('❌ Tailwind config missing content array');
    hasErrors = true;
  } else {
    console.log('✅ Tailwind config has content array');
  }
}

// Check PostCSS config
if (!existsSync('postcss.config.js')) {
  console.error('❌ No postcss.config.js found');
  hasErrors = true;
} else {
  console.log('✅ Found postcss.config.js');
  
  const postcssContent = readFileSync('postcss.config.js', 'utf-8');
  if (!postcssContent.includes('tailwindcss')) {
    console.error('❌ PostCSS config missing tailwindcss plugin');
    hasErrors = true;
  } else {
    console.log('✅ PostCSS config includes tailwindcss');
  }
}

if (hasErrors) {
  console.error('\n❌ Tailwind CSS configuration check failed');
  console.error('💡 Ensure:');
  console.error('   - globals.css exists with @tailwind directives');
  console.error('   - layout.tsx imports globals.css');
  console.error('   - tailwind.config.* exists with content array');
  console.error('   - postcss.config.js includes tailwindcss plugin');
  process.exit(1);
} else {
  console.log('\n✅ Tailwind CSS configuration is correct');
}
