# ProBillDesk Electron Build Instructions

This document explains how to build both frontend-only and full-stack versions of the ProBillDesk Electron application.

## Build Types

### 1. Frontend-Only Build
- **Purpose**: Creates an Electron app that only contains the React frontend
- **Backend**: Requires a separate backend server to be running
- **Use Case**: When you want to deploy the frontend and backend separately
- **File Size**: Smaller, faster to build

### 2. Full-Stack Build
- **Purpose**: Creates an Electron app that includes both frontend and backend
- **Backend**: Embedded Node.js backend server
- **Use Case**: Standalone desktop application
- **File Size**: Larger, includes all backend dependencies

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **npm**: Version 8 or higher
3. **Backend Dependencies**: For full-stack builds, backend dependencies must be installed

## Build Commands

### Frontend-Only Build

```bash
# Configure backend URL (optional, defaults to http://localhost:8247)
node configure-frontend-backend.js http://your-backend-url:8247

# Development mode (with hot reload)
npm run electron-dev-frontend

# Build for production
npm run build-frontend-only

# Build and create distributable
npm run dist-frontend-only
```

### Full-Stack Build

```bash
# Development mode (with hot reload and backend)
npm run electron-dev-fullstack

# Build for production
npm run build-fullstack

# Build and create distributable
npm run dist-fullstack
```

### Legacy Builds (Original)

```bash
# Original full-stack build
npm run build-electron
npm run dist

# Original development
npm run electron-dev-full
```

## Build Outputs

### Frontend-Only Build
- **Output Directory**: `dist-frontend/`
- **Main File**: `main-frontend-only.js`
- **Config File**: `electron-builder-frontend.json`
- **App ID**: `com.freshfocuztech.probilldesk.frontend`
- **Product Name**: `SubrivaBilling Frontend`

### Full-Stack Build
- **Output Directory**: `dist-fullstack/`
- **Main File**: `main-fullstack.js`
- **Config File**: `electron-builder-fullstack.json`
- **App ID**: `com.freshfocuztech.probilldesk.fullstack`
- **Product Name**: `SubrivaBilling Full Stack`

## Configuration Files

### Frontend-Only Configuration (`electron-builder-frontend.json`)
- Excludes backend files and dependencies
- Smaller bundle size
- Requires external backend server

### Full-Stack Configuration (`electron-builder-fullstack.json`)
- Includes backend folder as extra resource
- Includes backend dependencies
- Self-contained application

## Development Workflow

### For Frontend-Only Development
1. Start your backend server separately:
   ```bash
   npm run backend-dev
   ```
2. Start the frontend-only Electron app:
   ```bash
   npm run electron-dev-frontend
   ```

### For Full-Stack Development
1. Start both frontend and backend:
   ```bash
   npm run electron-dev-fullstack
   ```

## Production Deployment

### Frontend-Only Deployment
1. Build the frontend:
   ```bash
   npm run build-frontend-only
   ```
2. Deploy the backend separately to your server
3. Configure the frontend to connect to your backend URL

### Full-Stack Deployment
1. Build the full-stack application:
   ```bash
   npm run build-fullstack
   ```
2. Distribute the built application (no separate backend needed)

## File Structure

```
ProBillDesk/
├── main-frontend-only.js          # Frontend-only Electron main process
├── main-fullstack.js              # Full-stack Electron main process
├── electron-builder-frontend.json # Frontend-only build config
├── electron-builder-fullstack.json# Full-stack build config
├── backend-server.js              # Backend server integration
├── backend/                       # Backend source code
├── src/                          # Frontend source code
├── build/                        # Built frontend (created by npm run build)
├── dist-frontend/                # Frontend-only build output
└── dist-fullstack/               # Full-stack build output
```

## Troubleshooting

### Common Issues

1. **Backend Dependencies Not Found**
   - Run `npm run install-backend-deps` before building full-stack version

2. **Build Fails with Node.js Not Found**
   - Ensure Node.js is installed and in PATH
   - For full-stack builds, Node.js is required at runtime

3. **Frontend-Only App Shows API Errors**
   - Ensure backend server is running separately
   - Check backend URL configuration

4. **Full-Stack App Won't Start**
   - Check database connection
   - Verify backend dependencies are installed
   - Check port 8247 is available

### Build Optimization

- **Frontend-Only**: Faster builds, smaller size, requires external backend
- **Full-Stack**: Slower builds, larger size, self-contained

## Platform-Specific Notes

### Windows
- Uses NSIS installer
- Creates desktop and start menu shortcuts
- Requires Node.js for full-stack version

### macOS
- Creates DMG installer
- Code signing may be required for distribution

### Linux
- Creates AppImage
- May require additional dependencies for full-stack version

## Security Considerations

- Both versions use context isolation and disable node integration
- External links open in default browser
- Navigation is restricted to localhost and file protocols
- Backend server runs on localhost:8247 (full-stack version)

## Performance Notes

- Frontend-only version starts faster
- Full-stack version includes database initialization time
- Both versions include scroll optimization for better UX
- Memory usage is higher for full-stack version due to embedded backend
