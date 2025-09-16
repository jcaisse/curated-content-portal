#!/usr/bin/env node

import { randomBytes, randomUUID } from 'crypto';

/**
 * Generate a strong random string for secrets
 */
function generateSecret(length = 32) {
  return randomBytes(length).toString('base64').replace(/[+/=]/g, '');
}

/**
 * Generate a strong random password
 */
function generatePassword(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate secrets for environment files
 */
function generateSecrets() {
  console.log('🔐 Generated secrets:');
  console.log('');
  console.log('NEXTAUTH_SECRET=' + generateSecret(32));
  console.log('JWT_SECRET=' + generateSecret(32));
  console.log('POSTGRES_PASSWORD=' + generatePassword(24));
  console.log('ADMIN_PASSWORD=' + generatePassword(24));
  console.log('ADMIN_INGEST_KEY=' + generateSecret(32));
  console.log('');
  console.log('⚠️  Keep these secrets secure and never commit them to version control!');
}

/**
 * Generate a single secret by type
 */
function generateSingleSecret(type) {
  switch (type.toLowerCase()) {
    case 'nextauth':
    case 'nextauth_secret':
      console.log('NEXTAUTH_SECRET=' + generateSecret(32));
      break;
    case 'jwt':
    case 'jwt_secret':
      console.log('JWT_SECRET=' + generateSecret(32));
      break;
    case 'postgres':
    case 'postgres_password':
      console.log('POSTGRES_PASSWORD=' + generatePassword(24));
      break;
    case 'admin':
    case 'admin_password':
      console.log('ADMIN_PASSWORD=' + generatePassword(24));
      break;
    case 'ingest':
    case 'admin_ingest_key':
      console.log('ADMIN_INGEST_KEY=' + generateSecret(32));
      break;
    default:
      console.error('Unknown secret type:', type);
      console.log('Available types: nextauth, jwt, postgres, admin, ingest');
      process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  generateSecrets();
} else if (args.length === 1) {
  generateSingleSecret(args[0]);
} else {
  console.error('Usage: node scripts/gensecret.mjs [type]');
  console.log('Types: nextauth, jwt, postgres, admin, ingest');
  process.exit(1);
}
