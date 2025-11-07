# Auto-Update Release Process for SubrivaBilling

This document explains how to create and publish updates for SubrivaBilling that will automatically be delivered to users.

## Overview

SubrivaBilling uses `electron-updater` to automatically check for and install updates. Updates are distributed through GitHub Releases.

## Prerequisites

1. **GitHub Personal Access Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a token with `repo` permissions
   - Set environment variable: `GH_TOKEN=your_token_here`

2. **Version Management**
   - Current version in `package.json`: `2.0.2`
   - Follow semantic versioning (MAJOR.MINOR.PATCH)

## How Auto-Update Works

1. **On App Startup**: The app checks for updates 3 seconds after launching
2. **Automatic Check**: Every time the user opens "Help → Check for Updates"
3. **Background Download**: If an update is available, it downloads automatically
4. **User Notification**: User is notified when the download is complete
5. **Installation**: User can choose to restart immediately or later

## Creating a New Release

### Option 1: Using Version Scripts (Recommended)

We have automated scripts to manage versions:

```bash
# Patch release (2.0.2 → 2.0.3)
npm run version:patch:publish

# Minor release (2.0.2 → 2.1.0)
npm run version:minor:publish

# Major release (2.0.2 → 3.0.0)
npm run version:major:publish
```

These commands will:
- Update version in `package.json`
- Build the application
- Create installers for all platforms
- Create a Git tag
- Push to GitHub
- Create a GitHub Release with the installers

### Option 2: Manual Process

#### Step 1: Update Version

Edit `package.json`:
```json
{
  "version": "2.0.3"  // Increment version
}
```

#### Step 2: Build the Application

```bash
# Build React app and Electron installers
npm run build
npm run electron-pack
```

This creates installers in the `dist/` directory:
- Windows: `SubrivaBilling Setup 2.0.3.exe`
- macOS: `SubrivaBilling-2.0.3.dmg`
- Linux: `SubrivaBilling-2.0.3.AppImage`

#### Step 3: Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Create a new tag: `v2.0.3`
4. Release title: `Version 2.0.3`
5. Add release notes describing changes
6. Upload the installer files from `dist/` folder:
   - `SubrivaBilling Setup 2.0.3.exe`
   - `SubrivaBilling-2.0.3.dmg` (if building for macOS)
   - `SubrivaBilling-2.0.3.AppImage` (if building for Linux)
   - `latest.yml` (Windows update metadata - REQUIRED)
   - `latest-mac.yml` (macOS update metadata - if applicable)
   - `latest-linux.yml` (Linux update metadata - if applicable)

7. Publish the release

#### Step 4: Test the Update

1. Install the previous version on a test machine
2. Open the app
3. The app should automatically detect the new version
4. Follow the update prompts

## Important Files for Auto-Update

### 1. `latest.yml` (Windows)
Automatically generated during build. Contains:
```yaml
version: 2.0.3
files:
  - url: SubrivaBilling Setup 2.0.3.exe
    sha512: [hash]
    size: [bytes]
path: SubrivaBilling Setup 2.0.3.exe
sha512: [hash]
releaseDate: '2024-XX-XX'
```

### 2. `package.json` - Build Configuration
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "dilli2127",
      "repo": "SubrivaBilling",
      "releaseType": "release"
    }
  }
}
```

## Publishing with electron-builder

To automatically publish to GitHub:

```bash
# Set GitHub token
export GH_TOKEN=your_github_token

# Build and publish
npm run build
npx electron-builder --publish always
```

This will:
1. Build the installers
2. Create a GitHub release
3. Upload all files
4. Make the release immediately available

## Testing Updates

### Test on Development Build

1. Build version 2.0.2 and install it
2. Update version to 2.0.3 in `package.json`
3. Build and publish version 2.0.3
4. Open the 2.0.2 app
5. It should detect and download 2.0.3

### Test Update Notification

1. Help menu → "Check for Updates"
2. Should show update notification if available
3. Progress bar during download
4. Prompt to restart after download

## Update Flow for Users

```
1. User opens app
   ↓
2. App checks for updates (automatic)
   ↓
3. If update available:
   → Shows notification "Update Available: v2.0.3"
   → Downloads in background
   → Shows progress bar
   ↓
4. Download complete:
   → Shows modal "Update Downloaded"
   → Options: "Restart Now" or "Later"
   ↓
5. If "Restart Now":
   → App closes
   → Update installs
   → App reopens with new version
```

## Configuration in Code

### main.js
```javascript
// Auto-updater configuration
autoUpdater.autoDownload = true;        // Download automatically
autoUpdater.autoInstallOnAppQuit = true; // Install when app closes

// Check on startup (3 seconds after ready)
setTimeout(() => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}, 3000);
```

### preload.js
Exposes update APIs to renderer:
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback) => { /* ... */ },
  onUpdateProgress: (callback) => { /* ... */ }
});
```

### React Component (UpdateNotification.tsx)
Handles UI notifications for update status

## Troubleshooting

### Update not detected
- Check version in `package.json` is higher than installed version
- Verify `latest.yml` is uploaded to GitHub release
- Check GitHub release is marked as "Latest release"
- Verify repository name in `package.json` matches GitHub

### Download fails
- Check internet connection
- Verify GitHub release files are accessible
- Check file names match between `latest.yml` and uploaded files

### Update doesn't install
- Windows: Check antivirus/firewall settings
- Verify user has write permissions to app directory
- Check app logs for error messages

## Best Practices

1. **Always test updates** on a separate machine before releasing
2. **Write clear release notes** describing changes
3. **Use semantic versioning** consistently
4. **Keep installers signed** (code signing certificates)
5. **Maintain changelog** of all versions
6. **Test on all target platforms** (Windows, macOS, Linux)

## Security Notes

- Keep your GitHub token secure (never commit it)
- Use code signing for production releases
- Verify checksums in `latest.yml` match uploaded files
- Only publish releases from trusted sources

## Manual Update Check

Users can manually check for updates:
- Menu: Help → Check for Updates
- Keyboard: Ctrl+U (Windows/Linux) or Cmd+U (macOS)

## Questions?

For issues or questions:
- Check electron-updater documentation: https://www.electron.build/auto-update
- GitHub Issues: https://github.com/dilli2127/SubrivaBilling/issues

