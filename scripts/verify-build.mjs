#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function verifyBuild() {
  console.log('🔍 Verifying build integrity...');

  try {
    // Get current git commit SHA
    const gitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    console.log(`📋 Current commit: ${gitSha}`);

    // Check if the built image exists
    let imageId;
    try {
      const composeOutput = execSync('docker compose images app --quiet', { encoding: 'utf8' }).trim();
      imageId = composeOutput;
    } catch (error) {
      // Fallback to direct image check
      try {
        imageId = 'cleanportal-app:latest';
        execSync(`docker inspect ${imageId}`, { stdio: 'pipe' });
      } catch (inspectError) {
        console.error('❌ No app image found. Run `npm run build:image` first.');
        process.exit(1);
      }
    }

    // Get image labels
    const labelsOutput = execSync(`docker inspect ${imageId} --format '{{json .Config.Labels}}'`, { encoding: 'utf8' });
    const labels = JSON.parse(labelsOutput);

    const imageRevision = labels['org.opencontainers.image.revision'];
    
    if (!imageRevision) {
      console.error('❌ Image missing commit SHA label');
      process.exit(1);
    }

    console.log(`🏷️  Image commit: ${imageRevision}`);

    // Verify match
    if (imageRevision === gitSha) {
      console.log('✅ Build verification passed - image matches current commit');
    } else {
      console.error('❌ Build verification failed - image commit does not match current commit');
      console.error(`   Expected: ${gitSha}`);
      console.error(`   Found: ${imageRevision}`);
      process.exit(1);
    }

    // Additional checks
    console.log('🔍 Running additional integrity checks...');

    // Check if .secrets/.env.local exists
    const envFile = join(process.cwd(), '.secrets', '.env.local');
    if (!existsSync(envFile)) {
      console.warn('⚠️  .secrets/.env.local not found - run `npm run env:bootstrap`');
    } else {
      console.log('✅ Environment file found');
    }

    // Check Docker Compose configuration
    try {
      execSync('docker compose config --quiet', { stdio: 'pipe' });
      console.log('✅ Docker Compose configuration is valid');
    } catch (error) {
      console.error('❌ Docker Compose configuration is invalid');
      process.exit(1);
    }

    console.log('\n🎉 All build verification checks passed!');
    console.log(`📦 Image ID: ${imageId}`);
    console.log(`🔗 Commit SHA: ${gitSha}`);

  } catch (error) {
    console.error('❌ Build verification failed:', error.message);
    process.exit(1);
  }
}

verifyBuild();
