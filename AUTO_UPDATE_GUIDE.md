# Auto-Update Guide for SubrivaBilling

This guide explains how to set up and use the automatic update system for your Electron application.

## Features

- ✅ Automatic update checking on app startup
- ✅ Manual update checking via Help menu (Ctrl+U)
- ✅ Visual update status in the header
- ✅ Download progress indicators
- ✅ One-click update installation
- ✅ GitHub releases integration
- ✅ Cross-platform support (Windows, macOS, Linux)

## How It Works

1. **Update Detection**: The app automatically checks for updates when it starts
2. **Download**: Updates are downloaded in the background
3. **Installation**: Users can install updates with one click
4. **Restart**: The app restarts automatically to apply updates

## For Developers

### Publishing Updates

#### Method 1: Using npm scripts (Recommended)

```bash
# For patch updates (bug fixes)
npm run version:patch:publish

# For minor updates (new features)
npm run version:minor:publish

# For major updates (breaking changes)
npm run version:major:publish
```

#### Method 2: Manual process

1. Update version in `package.json`
2. Build the app: `npm run build`
3. Create Electron build: `npm run electron-pack`
4. Create a GitHub release with the built files
5. Push the tag: `git tag v1.0.0 && git push origin v1.0.0`

### Testing Updates

1. **Local Testing**:
   ```bash
   # Build and test locally
   npm run electron-pack
   ```

2. **Update Flow Testing**:
   - Install the current version
   - Publish a new version
   - Launch the app to see update detection

### Configuration

The auto-updater is configured in `main.js`:

```javascript
// Auto-updater settings
autoUpdater.autoDownload = true;           // Auto-download updates
autoUpdater.autoInstallOnAppQuit = true;   // Auto-install on quit
```

### GitHub Integration

The app is configured to check for updates from GitHub releases:

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

## For Users

### Checking for Updates

1. **Automatic**: Updates are checked automatically when the app starts
2. **Manual**: Go to Help → Check for Updates (or press Ctrl+U)
3. **Visual**: Look for the update status indicator in the header

### Installing Updates

1. When an update is available, you'll see a notification
2. Click "Download" to start downloading
3. Once downloaded, click "Install Now" to install
4. The app will restart automatically

### Update Status Indicators

- 🔄 **Checking**: App is checking for updates
- ⬇️ **Available**: Update is available for download
- 📥 **Downloading**: Update is being downloaded
- ✅ **Ready**: Update is downloaded and ready to install
- ❌ **Error**: There was an error checking/downloading

## Troubleshooting

### Common Issues

1. **Updates not detected**:
   - Check internet connection
   - Verify GitHub repository settings
   - Check if the release was published correctly

2. **Download fails**:
   - Check available disk space
   - Verify network connection
   - Check GitHub release files

3. **Installation fails**:
   - Run app as administrator (Windows)
   - Check file permissions
   - Ensure no other instances are running

### Debug Mode

To enable debug logging for updates:

1. Open Developer Tools (F12)
2. Check the Console for update-related messages
3. Look for messages starting with "Checking for update", "Update available", etc.

## Security

- Updates are signed and verified
- Only updates from the configured GitHub repository are accepted
- All downloads are over HTTPS
- Updates are checked against the published release signatures

## Best Practices

1. **Version Numbering**: Use semantic versioning (major.minor.patch)
2. **Release Notes**: Always include detailed release notes
3. **Testing**: Test updates thoroughly before publishing
4. **Rollback Plan**: Keep previous versions available for rollback
5. **User Communication**: Notify users about important updates

## Support

If you encounter issues with the auto-update system:

1. Check the console logs for error messages
2. Verify your GitHub repository configuration
3. Ensure the release was published correctly
4. Check network connectivity and firewall settings

For additional help, refer to the [electron-updater documentation](https://github.com/electron-userland/electron-updater).
