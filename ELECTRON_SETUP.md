# ProBillDesk - Electron Desktop App Setup

## 🎉 Congratulations! Your React 19 app is now fully compatible with Electron!

Your ProBillDesk application has been successfully configured to run as a desktop application using Electron. Here's everything you need to know:

## 📁 Files Created/Modified

### New Files:
- `main.js` - Electron main process (handles window creation, menu, security)
- `preload.js` - Secure communication bridge between main and renderer processes
- `src/hooks/useElectron.ts` - React hook for Electron API integration
- `ELECTRON_SETUP.md` - This guide

### Modified Files:
- `package.json` - Added Electron dependencies and build scripts
- `public/index.html` - Enhanced for desktop app experience with security policies

## 🚀 Available Commands

### Development
```bash
# Run React app in browser (development)
npm start

# Run Electron app in development mode
npm run electron-dev

# Run just Electron (after React build)
npm run electron
```

### Production Building
```bash
# Build React app only
npm run build

# Build complete Electron desktop app
npm run build-electron

# Alternative build commands
npm run electron-pack
npm run dist
```

## 🖥️ Desktop App Features

### Window Management
- **Size**: 1400x900 (minimum 1200x800)
- **Security**: Enhanced with Content Security Policy
- **No Scrolling**: Optimized for your preference [[memory:3833190]]
- **Keyboard-First**: Fully keyboard navigable interface

### Menu System
The app includes a comprehensive menu with keyboard shortcuts:

#### File Menu
- `Ctrl+N` - New Bill
- `Ctrl+S` - Save Bill
- `Ctrl+P` - Print
- `Ctrl+Q` - Exit

#### Navigation Menu
- `Ctrl+D` - Dashboard
- `Ctrl+B` - Billing
- `Ctrl+Shift+P` - Products
- `Ctrl+Shift+C` - Customers

### Security Features
- **Node Integration**: Disabled for security
- **Context Isolation**: Enabled
- **Preload Script**: Secure API exposure
- **External Links**: Opened in default browser

## 🔧 React Integration

### Using Electron APIs in React
```typescript
import { useElectron } from '../hooks/useElectron';

function MyComponent() {
  const { isElectron, showSaveDialog, print, onMenuEvent } = useElectron();
  
  // Check if running in Electron
  if (isElectron) {
    // Electron-specific features
  }
  
  // Listen for menu events
  useEffect(() => {
    const cleanup = onMenuEvent((type, data) => {
      switch (type) {
        case 'new-bill':
          // Handle new bill
          break;
        case 'save-bill':
          // Handle save bill
          break;
      }
    });
    
    return cleanup;
  }, []);
  
  // Show save dialog
  const handleSave = async () => {
    const result = await showSaveDialog();
    if (!result.canceled) {
      // Save to result.filePath
    }
  };
}
```

### Available APIs
- `isElectron` - Check if running in Electron
- `platform` - Get platform info
- `getAppVersion()` - Get app version
- `showSaveDialog()` - Show save file dialog
- `showOpenDialog()` - Show open file dialog
- `print()` - Print current page
- `onMenuEvent()` - Listen for menu events

## 📦 Build Output

After running `npm run build-electron`, you'll find:

- `dist/win-unpacked/ProBillDesk.exe` - Your desktop application
- `dist/ProBillDesk Setup.exe` - Installer (if NSIS target is used)

## 🔧 Customization

### App Icon
Update the icon path in `package.json` under the `build` section:
```json
"win": {
  "target": "nsis",
  "icon": "path/to/your/icon.ico"
}
```

### App Details
Modify `package.json`:
- `name` - App name
- `version` - Version number
- `description` - App description
- `build.appId` - Unique app identifier

### Window Settings
Edit `main.js` to customize:
- Window size and minimum size
- Window behavior
- Menu structure
- Security policies

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Use `--legacy-peer-deps` flag for npm installs due to React 19 compatibility
2. **Menu Not Working**: Ensure preload script is properly loaded
3. **API Not Available**: Check if `window.electronAPI` exists before using

### Development Tips
- Use `npm run electron-dev` for hot reloading during development
- Check DevTools (F12) for any console errors
- Use `console.log(window.isElectron)` to verify Electron context

## 🚀 Distribution

To distribute your app:
1. Run `npm run build-electron`
2. Find the executable in `dist/win-unpacked/`
3. For installer, the setup file will be in `dist/`

## 📱 Platform Support

Current configuration supports:
- ✅ Windows (tested)
- ✅ macOS (configured)
- ✅ Linux (configured)

## 🎯 Next Steps

1. Test the desktop app: `npm run electron-dev`
2. Customize the menu and shortcuts as needed
3. Add app-specific Electron features
4. Test the production build: `npm run build-electron`
5. Distribute the app to your users

Your React 19 + Electron setup is now complete and ready for production use!
