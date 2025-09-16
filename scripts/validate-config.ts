#!/usr/bin/env ts-node

/**
 * Configuration validation script
 * Run this to verify environment configuration is properly loaded
 */

import { config, validateConfig } from '../src/lib/config';

async function main() {
  console.log('🔍 Validating environment configuration...\n');
  
  try {
    // Test configuration loading
    validateConfig();
    
    // Display loaded configuration (without sensitive data)
    console.log('📋 Configuration Summary:');
    console.log(`  Database URL: ${config.database.url.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`  Auth URL: ${config.auth.url}`);
    console.log(`  Admin Email: ${config.auth.adminEmail}`);
    console.log(`  OpenAI Model: ${config.ai.model}`);
    console.log(`  OpenAI API Key: ${config.ai.apiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  File Storage Strategy: ${config.content.fileStorageStrategy}`);
    console.log(`  RSS Feed URLs: ${config.content.rssFeedUrls ? 'Configured' : 'Not configured'}`);
    console.log(`  Web Crawl Enabled: ${config.content.webCrawlEnabled}`);
    console.log(`  Node Environment: ${config.app.nodeEnv}`);
    console.log(`  Log Level: ${config.app.logLevel}`);
    
    // Test environment variable loading
    console.log('\n🔧 Environment Variables Test:');
    const testVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL', 
      'NEXTAUTH_SECRET',
      'OPENAI_API_KEY',
      'ADMIN_EMAIL',
      'NODE_ENV'
    ];
    
    for (const varName of testVars) {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      const displayValue = value ? (varName.includes('SECRET') || varName.includes('KEY') ? '***' : value) : 'Not set';
      console.log(`  ${status} ${varName}: ${displayValue}`);
    }
    
    console.log('\n✅ Configuration validation completed successfully!');
    console.log('🎯 Gate G0: Config ready - All environment configuration validated');
    
  } catch (error) {
    console.error('\n❌ Configuration validation failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
