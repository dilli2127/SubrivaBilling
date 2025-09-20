# SubrivaBilling - Desktop Billing Application

A professional billing and inventory management desktop application built with React 19, Electron, and Node.js.

## Features

- **Desktop Application**: Cross-platform desktop app using Electron
- **Integrated Backend**: Built-in FocuzBilling API server
- **Modern UI**: React 19 with Ant Design components
- **Keyboard-Driven**: Fully keyboard-driven interface (no mouse required)
- **No Scrolling**: Optimized for desktop with no page-level scrolling
- **Billing Management**: Complete billing and inventory management system

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MySQL database (for backend)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd SubrivaBilling
   npm run setup
   ```

2. **Configure Database**:
   - Update `backend/electron.env` with your database credentials
   - Ensure MySQL is running on your system

3. **Run the application**:
   ```bash
   # Development mode (both frontend and backend)
   npm run dev-full
   
   # Or run Electron app directly
   npm run electron-dev-full
   ```

## Available Scripts

- `npm start` - Start React development server
- `npm run backend` - Start backend API server only
- `npm run backend-dev` - Start backend with nodemon (auto-restart)
- `npm run dev-full` - Start both frontend and backend
- `npm run electron` - Run Electron app (production)
- `npm run electron-dev` - Run Electron app (development)
- `npm run electron-dev-full` - Run Electron app with both frontend and backend
- `npm run build` - Build React app for production
- `npm run build-electron` - Build and package Electron app
- `npm run setup` - Install all dependencies
- `npm run clean` - Clean all build artifacts
- `npm run reset` - Clean and reinstall everything

## Project Structure

```
SubrivaBilling/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── ...
├── backend/               # FocuzBilling API backend
│   ├── src/              # Backend source code
│   ├── electron.env      # Desktop app configuration
│   └── ...
├── main.js               # Electron main process
├── preload.js            # Electron preload script
├── backend-server.js     # Backend server management
└── package.json          # Dependencies and scripts
```

## Configuration

### Backend Configuration

Edit `backend/electron.env` to configure:
- Database connection
- Server port (default: 8247)
- JWT secret key
- Other environment variables

### Database Setup

1. Create a MySQL database
2. Update database credentials in `backend/electron.env`
3. The backend will automatically run migrations on startup

## Development

### Running in Development Mode

1. **Full Development** (Recommended):
   ```bash
   npm run electron-dev-full
   ```
   This starts both the React dev server and the backend API server, then launches the Electron app.

2. **Separate Development**:
   ```bash
   # Terminal 1: Start backend
   npm run backend-dev
   
   # Terminal 2: Start frontend
   npm start
   
   # Terminal 3: Start Electron
   npm run electron-dev
   ```

### Building for Production

```bash
# Build the application
npm run build-electron

# The built app will be in the `dist/` directory
```

## API Integration

The application automatically detects if it's running in Electron and uses the embedded backend server. The API service (`src/services/api/`) handles:

- Dynamic backend URL detection
- Authentication token management
- Error handling and retries
- Request/response interceptors

## Troubleshooting

### Backend Won't Start

1. Check if port 8247 is available
2. Verify database connection in `backend/electron.env`
3. Ensure all backend dependencies are installed: `npm run install-backend-deps`

### Frontend Can't Connect to Backend

1. Ensure backend is running on port 8247
2. Check browser console for connection errors
3. Verify `electron.env` configuration

### Database Issues

1. Ensure MySQL is running
2. Check database credentials in `backend/electron.env`
3. Verify database exists and is accessible

## License

Private - Fresh Focuz Tech

## Support

For issues and questions, please contact the development team.