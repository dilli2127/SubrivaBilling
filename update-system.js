const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class UpdateSystem {
  constructor() {
    this.versionTypes = {
      patch: 'patch',    // 2.0.0 -> 2.0.1 (bug fixes)
      minor: 'minor',    // 2.0.0 -> 2.1.0 (new features)
      major: 'major'     // 2.0.0 -> 3.0.0 (breaking changes)
    };
  }

  // Get current version from package.json
  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }

  // Update version in package.json and main.js
  updateVersion(newVersion) {
    console.log(`🔄 Updating version to ${newVersion}...`);
    
    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    // Update main.js version in About dialog
    let mainJs = fs.readFileSync('main.js', 'utf8');
    mainJs = mainJs.replace(
      /Version: [\d.]+/,
      `Version: ${newVersion}`
    );
    fs.writeFileSync('main.js', mainJs);
    
    console.log(`✅ Version updated to ${newVersion}`);
  }

  // Build and deploy update
  async deployUpdate(versionType, message) {
    try {
      console.log(`🚀 Starting ${versionType} update deployment...`);
      
      // 1. Bump version
      console.log('📈 Bumping version...');
      execSync(`npx standard-version --release-as ${versionType} --releaseCommitMessageFormat "chore(release): {{currentTag}} - ${message}"`, { stdio: 'inherit' });
      
      // 2. Get new version
      const newVersion = this.getCurrentVersion();
      console.log(`📦 New version: ${newVersion}`);
      
      // 3. Build React app
      console.log('⚛️ Building React app...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // 4. Install backend dependencies
      console.log('📦 Installing backend dependencies...');
      execSync('npm run install-backend-deps', { stdio: 'inherit' });
      
      // 5. Build and publish Electron app
      console.log('⚡ Building and publishing Electron app...');
      execSync('npx electron-builder --publish=always', { stdio: 'inherit' });
      
      console.log('✅ Update deployed successfully!');
      console.log(`🎉 Version ${newVersion} is now available to users!`);
      
      return newVersion;
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  // Quick patch update (bug fixes)
  async patchUpdate(message = 'Bug fixes and improvements') {
    return await this.deployUpdate(this.versionTypes.patch, message);
  }

  // Minor update (new features)
  async minorUpdate(message = 'New features and enhancements') {
    return await this.deployUpdate(this.versionTypes.minor, message);
  }

  // Major update (breaking changes)
  async majorUpdate(message = 'Major update with breaking changes') {
    return await this.deployUpdate(this.versionTypes.major, message);
  }

  // Show current status
  showStatus() {
    const currentVersion = this.getCurrentVersion();
    console.log(`📋 Current version: ${currentVersion}`);
    console.log('🔄 Update system ready for continuous updates!');
    console.log('');
    console.log('Available commands:');
    console.log('  node update-system.js patch "Bug fixes"');
    console.log('  node update-system.js minor "New features"');
    console.log('  node update-system.js major "Breaking changes"');
    console.log('  node update-system.js status');
  }
}

// CLI interface
if (require.main === module) {
  const updateSystem = new UpdateSystem();
  const command = process.argv[2];
  const message = process.argv[3] || 'Update';

  switch (command) {
    case 'patch':
      updateSystem.patchUpdate(message).catch(console.error);
      break;
    case 'minor':
      updateSystem.minorUpdate(message).catch(console.error);
      break;
    case 'major':
      updateSystem.majorUpdate(message).catch(console.error);
      break;
    case 'status':
      updateSystem.showStatus();
      break;
    default:
      updateSystem.showStatus();
  }
}

module.exports = UpdateSystem;
