#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get command line arguments
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major
const shouldPublish = args.includes('--publish') || args.includes('-p');

// Validate version type
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

console.log(`🚀 Updating version (${versionType})...`);

try {
  // Read package.json
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Get current version
  const currentVersion = packageJson.version;
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Update version
  const versionParts = currentVersion.split('.').map(Number);
  let [major, minor, patch] = versionParts;
  
  switch (versionType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
  }
  
  const newVersion = `${major}.${minor}.${patch}`;
  packageJson.version = newVersion;
  
  // Write updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Version updated to: ${newVersion}`);
  
  // Build the app
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Build Electron app
  console.log('⚡ Building Electron app...');
  execSync('npm run electron-pack', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  if (shouldPublish) {
    console.log('📤 Publishing to GitHub...');
    
    // Create git tag
    execSync(`git tag v${newVersion}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    
    // Push to GitHub
    execSync('git push origin main', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    
    // Publish release using electron-builder
    console.log('🚀 Publishing release...');
    execSync('npx electron-builder --publish=always', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    
    console.log('🎉 Successfully published new version!');
  } else {
    console.log('📝 To publish this version, run:');
    console.log(`   node scripts/update-version.js ${versionType} --publish`);
  }
  
} catch (error) {
  console.error('❌ Error updating version:', error.message);
  process.exit(1);
}
