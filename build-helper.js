#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const buildType = process.argv[2];

if (!buildType || !['frontend-only', 'fullstack', 'both'].includes(buildType)) {
  console.log(`
Usage: node build-helper.js <build-type>

Build Types:
  frontend-only  - Build only the frontend Electron app
  fullstack      - Build the full-stack Electron app with backend
  both           - Build both versions

Examples:
  node build-helper.js frontend-only
  node build-helper.js fullstack
  node build-helper.js both
`);
  process.exit(1);
}

console.log(`🚀 Starting ${buildType} build process...\n`);

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if Node.js is installed
  try {
    execSync('node --version', { stdio: 'pipe' });
    console.log('✅ Node.js is installed');
  } catch (error) {
    console.error('❌ Node.js is not installed or not in PATH');
    process.exit(1);
  }

  // Check if npm is installed
  try {
    execSync('npm --version', { stdio: 'pipe' });
    console.log('✅ npm is installed');
  } catch (error) {
    console.error('❌ npm is not installed or not in PATH');
    process.exit(1);
  }

  // Check if required files exist
  const requiredFiles = [
    'package.json',
    'main-frontend-only.js',
    'main-fullstack.js',
    'electron-builder-frontend.json',
    'electron-builder-fullstack.json'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Required file missing: ${file}`);
      process.exit(1);
    }
  }

  console.log('✅ All prerequisites met\n');
}

function buildFrontendOnly() {
  console.log('🎨 Building Frontend-Only Version...\n');
  
  // Check if backend URL is configured
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8247';
  console.log(`🔗 Using backend URL: ${backendUrl}`);
  console.log('⚠️  Make sure your backend server is running at this URL\n');
  
  runCommand('npm run build', 'Building React frontend');
  runCommand('npm run build-frontend-only', 'Building Electron frontend-only app');
  
  console.log('✅ Frontend-only build completed!');
  console.log('📁 Output directory: dist-frontend/');
  console.log('📝 Note: This version requires a separate backend server');
  console.log(`📝 Backend URL: ${backendUrl}\n`);
}

function buildFullStack() {
  console.log('🔧 Building Full-Stack Version...\n');
  
  runCommand('npm run build', 'Building React frontend');
  runCommand('npm run install-backend-deps', 'Installing backend dependencies');
  runCommand('npm run build-fullstack', 'Building Electron full-stack app');
  
  console.log('✅ Full-stack build completed!');
  console.log('📁 Output directory: dist-fullstack/');
  console.log('📝 Note: This version includes embedded backend server\n');
}

// Main execution
checkPrerequisites();

switch (buildType) {
  case 'frontend-only':
    buildFrontendOnly();
    break;
    
  case 'fullstack':
    buildFullStack();
    break;
    
  case 'both':
    buildFrontendOnly();
    buildFullStack();
    break;
}

console.log('🎉 Build process completed successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Test the built applications');
console.log('2. Distribute the appropriate version based on your needs');
console.log('3. For frontend-only: Ensure backend server is running');
console.log('4. For full-stack: No additional setup required');
