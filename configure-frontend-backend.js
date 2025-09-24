#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const backendUrl = process.argv[2];

if (!backendUrl) {
  console.log(`
Usage: node configure-frontend-backend.js <backend-url>

Examples:
  node configure-frontend-backend.js http://localhost:8247
  node configure-frontend-backend.js https://api.yourdomain.com
  node configure-frontend-backend.js http://192.168.1.100:8247

This will configure the frontend-only build to connect to the specified backend URL.
`);
  process.exit(1);
}

// Validate URL format
try {
  new URL(backendUrl);
} catch (error) {
  console.error('❌ Invalid URL format:', backendUrl);
  console.error('Please provide a valid URL (e.g., http://localhost:8247)');
  process.exit(1);
}

console.log(`🔧 Configuring frontend-only build to use backend: ${backendUrl}`);

// Update package.json build script
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update the build-frontend-only script
packageJson.scripts['build-frontend-only'] = `cross-env REACT_APP_API_URL=${backendUrl} npm run build && npx electron-builder --config electron-builder-frontend.json --publish=never`;
packageJson.scripts['electron-dev-frontend'] = `concurrently "cross-env REACT_APP_API_URL=${backendUrl} npm start" "wait-on http://localhost:3000 && npx electron main-frontend-only.js"`;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update the frontend-only.env file
const envContent = `# Frontend-Only Build Configuration
# This file sets the external backend URL for the frontend-only Electron build

# External Backend URL - Change this to your backend server URL
REACT_APP_API_URL=${backendUrl}

# Build Configuration
NODE_ENV=production
`;

fs.writeFileSync(path.join(__dirname, 'frontend-only.env'), envContent);

console.log('✅ Configuration updated successfully!');
console.log('');
console.log('📋 Updated files:');
console.log('  - package.json (build scripts)');
console.log('  - frontend-only.env (environment variables)');
console.log('');
console.log('🚀 You can now run:');
console.log('  npm run build-frontend-only');
console.log('  npm run electron-dev-frontend');
console.log('');
console.log('⚠️  Make sure your backend server is running at:', backendUrl);
