#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Auth Smoke Test Script
 * 
 * Tests the credentials endpoint to ensure authentication is working
 * before running E2E tests.
 */
async function runAuthSmokeTest() {
  console.log('🧪 Running auth smoke test...');

  try {
    // Load environment variables
    const envFilePath = join(process.cwd(), '.secrets', '.env.local');
    const envContent = readFileSync(envFilePath, 'utf-8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, value] = trimmedLine.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim().replace(/^"|"$/g, '');
        }
      }
    });

    const adminEmail = envVars.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = envVars.ADMIN_PASSWORD;
    const appUrl = envVars.NEXTAUTH_URL || 'http://localhost:3000';

    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD not found in environment');
      process.exit(1);
    }

    console.log(`📧 Testing with email: ${adminEmail}`);
    console.log(`🌐 App URL: ${appUrl}`);

    // Test the auth check endpoint
    const response = await fetch(`${appUrl}/api/test/auth-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'E2E-Test-Mode': 'true'
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      })
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      console.log('✅ Auth smoke test passed');
      console.log(`📊 Response: ${JSON.stringify(result, null, 2)}`);
    } else {
      console.error('❌ Auth smoke test failed');
      console.error(`📊 Status: ${response.status}`);
      console.error(`📊 Response: ${JSON.stringify(result, null, 2)}`);
      
      if (result.reason) {
        console.error(`💡 Reason: ${result.reason}`);
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Auth smoke test error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the app is running on the expected port');
      console.error('   Try: docker compose --env-file ./.secrets/.env.local up -d');
    }
    
    process.exit(1);
  }
}

runAuthSmokeTest();
