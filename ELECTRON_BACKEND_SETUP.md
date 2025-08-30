# Electron Backend Integration Setup Guide

## Overview

Your ProBillDesk application now has a fully integrated backend API running within the Electron application. This means:

- ✅ **Self-contained**: No need for external API servers
- ✅ **Offline capable**: Works without internet connection
- ✅ **Secure**: Backend runs locally within the desktop app
- ✅ **Easy deployment**: Single executable includes both frontend and backend

## Architecture

```
┌─────────────────────────────────────────┐
│           Electron Main Process         │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │   Frontend      │ │   Backend       │ │
│  │   (React)       │ │   (Express)     │ │
│  │   Port: 3000    │ │   Port: 8080    │ │
│  └─────────────────┘ └─────────────────┘ │
│           │                   │          │
│           └───── IPC ─────────┘          │
└─────────────────────────────────────────┘
```

## Files Added/Modified

### New Files:
- `backend-server.js` - Backend server management
- `backend/electron.env` - Environment configuration for Electron
- `src/services/electronBackend.ts` - Frontend-backend communication service

### Modified Files:
- `main.js` - Added backend server startup/shutdown
- `preload.js` - Added backend URL exposure to renderer
- `package.json` - Added backend dependencies and scripts
- `src/services/api/index.ts` - Updated to use dynamic backend URL
- `backend/src/routes/router.js` - Added health check endpoint

## Setup Instructions

### 1. Install Dependencies

```bash
# Install all dependencies (including backend)
npm install

# Or manually install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

**PostgreSQL Setup:**

1. Install PostgreSQL on your system
2. Create a database named `probilldesk`:
   ```sql
   CREATE DATABASE probilldesk;
   ```

3. Update database configuration in `backend/electron.env`:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/probilldesk
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DATABASE_NAME=probilldesk
   ```

### 3. Environment Configuration

Edit `backend/electron.env` with your local settings:

```env
# Database (Required)
DATABASE_URL=postgresql://postgres:password@localhost:5432/probilldesk
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Security (Required)
SECRET_KEY=your-unique-secret-key-change-this

# Optional: File storage, email, SMS, etc.
# Leave empty for basic functionality
```

### 4. Development Mode

```bash
# Start both frontend and backend in development
npm run electron-full-dev
```

This will:
1. Start React development server (port 3000)
2. Start Electron with backend server (port 8080)
3. Automatically reload on file changes

### 5. Production Build

```bash
# Build for production
npm run build-electron
```

This creates a standalone executable in the `dist/` folder.

## How It Works

### Backend Server Lifecycle

1. **Startup**: When Electron starts, it automatically launches the Express server
2. **Health Check**: Frontend waits for backend to be ready before making API calls
3. **API Calls**: All existing API calls now route to `http://localhost:8080`
4. **Shutdown**: Backend server stops gracefully when Electron quits

### Frontend Integration

The frontend automatically detects if it's running in Electron and uses the embedded backend:

```typescript
// Automatically uses http://localhost:8080 in Electron
// Falls back to external API in browser
const response = await requestBackServer({
  method: 'GET',
  endpoint: '/products'
});
```

### Database Migrations

The backend automatically runs database migrations on startup:
- **Development**: Uses `sync({ alter: true })` for automatic schema updates
- **Production**: Uses proper migrations from `backend/migrations/`

## Troubleshooting

### Backend Server Won't Start

1. **Check Database Connection**:
   - Ensure PostgreSQL is running
   - Verify credentials in `backend/electron.env`
   - Test connection: `psql -U postgres -d probilldesk`

2. **Port Conflicts**:
   - Ensure port 8080 is available
   - Change `HTTP_PORT` in `backend/electron.env` if needed

3. **Missing Dependencies**:
   ```bash
   cd backend
   npm install
   ```

### Frontend API Errors

1. **Check Browser Console**:
   - Look for backend URL initialization messages
   - Verify health check passes

2. **Network Issues**:
   - Ensure backend health endpoint responds: `http://localhost:8080/api/health`

### Database Issues

1. **Migration Errors**:
   - Check database permissions
   - Verify PostgreSQL version compatibility
   - Clear and recreate database if needed

2. **Connection Pool Errors**:
   - Restart the application
   - Check database server status

## Development Tips

### Hot Reload

Use `npm run electron-full-dev` for the best development experience:
- React hot reload works normally
- Backend restarts on file changes (if using nodemon)
- Database schema updates automatically in development

### Debugging

1. **Backend Logs**: Check Electron console for backend server logs
2. **Frontend Logs**: Use browser DevTools as usual
3. **Database Queries**: Set `SQL_LOG=true` in `backend/electron.env`

### API Testing

Test the embedded backend directly:
```bash
# Health check
curl http://localhost:8080/api/health

# Login endpoint
curl -X POST http://localhost:8080/api/billing_login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## Production Deployment

### Single Executable

The built application (`ProBillDesk Setup 0.1.0.exe`) contains:
- Electron runtime
- React frontend (built)
- Express backend
- All Node.js dependencies

### Database Requirements

Users will need:
1. PostgreSQL installed locally
2. Database created and configured
3. Network access (if using external database)

### Distribution Options

1. **Standalone**: Include PostgreSQL installer with your app
2. **Cloud Database**: Configure to use hosted PostgreSQL
3. **SQLite**: Consider switching to SQLite for simpler deployment

## Next Steps

1. **Test the integration**: Run `npm run electron-full-dev`
2. **Configure your database**: Update `backend/electron.env`
3. **Test API endpoints**: Verify all your existing functionality works
4. **Build for production**: Run `npm run build-electron`

## Support

If you encounter issues:
1. Check the console logs in Electron
2. Verify database connectivity
3. Test API endpoints directly
4. Check environment configuration

The integration is now complete! Your Electron app has a fully embedded backend API server. 🚀
