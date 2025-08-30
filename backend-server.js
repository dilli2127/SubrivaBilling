const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let backendProcess = null;
let isServerRunning = false;

/**
 * Start the backend server
 */
function startBackendServer() {
  return new Promise((resolve, reject) => {
    if (isServerRunning) {
      console.log('Backend server is already running');
      resolve();
      return;
    }

    const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === '1';
    
    // Handle different paths for development vs production
    let backendPath;
    if (require('electron').app.isPackaged) {
      // In production, backend folder is in the same directory as the main process
      backendPath = path.join(__dirname, 'backend');
    } else {
      // In development, backend folder is in the project root
      backendPath = path.join(__dirname, 'backend');
    }
    
    // Check if backend directory exists
    if (!fs.existsSync(backendPath)) {
      reject(new Error('Backend directory not found'));
      return;
    }

    // Load environment from electron.env file
    const envPath = path.join(backendPath, 'electron.env');
    const envConfig = {};
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !line.startsWith('#')) {
          envConfig[key.trim()] = value.trim();
        }
      });
      console.log('✅ Loaded environment configuration from electron.env');
    } else {
      console.warn('⚠️ electron.env file not found, using default values');
    }

    // Environment variables for the backend
    const env = {
      ...process.env,
      ...envConfig,
      NODE_ENV: isDev ? 'development' : 'production',
      HTTP_PORT: envConfig.HTTP_PORT || '8247',
      HTTPS_PORT: '', // Disable HTTPS for local desktop app
      SECURE: 'false', // Disable security features for local use
      PROD: 'false', // Always run in development mode for desktop
      DEBUG: 'false',
      CRON: 'false', // Disable cron jobs for desktop app
      SERVER_LOG: 'false', // Disable server logging for performance
    };

    console.log('Starting backend server...');
    
    // Start the backend server
    backendProcess = spawn('node', ['src/server.js'], {
      cwd: backendPath,
      env: env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle stdout
    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data.toString()}`);
      if (data.toString().includes('HTTP server started at')) {
        isServerRunning = true;
        console.log('✅ Backend server started successfully');
        resolve();
      }
    });

    // Handle stderr
    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data.toString()}`);
    });

    // Handle process exit
    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      isServerRunning = false;
      backendProcess = null;
    });

    // Handle process error
    backendProcess.on('error', (error) => {
      console.error('Failed to start backend server:', error);
      isServerRunning = false;
      backendProcess = null;
      reject(error);
    });

    // Timeout after 30 seconds if server doesn't start
    setTimeout(() => {
      if (!isServerRunning) {
        reject(new Error('Backend server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

/**
 * Stop the backend server
 */
function stopBackendServer() {
  return new Promise((resolve) => {
    if (backendProcess && !backendProcess.killed) {
      console.log('Stopping backend server...');
      
      backendProcess.on('close', () => {
        console.log('✅ Backend server stopped');
        isServerRunning = false;
        backendProcess = null;
        resolve();
      });

      // Try graceful shutdown first
      backendProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds if graceful shutdown fails
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          backendProcess.kill('SIGKILL');
        }
      }, 5000);
    } else {
      isServerRunning = false;
      backendProcess = null;
      resolve();
    }
  });
}

/**
 * Check if backend server is running
 */
function isBackendRunning() {
  return isServerRunning;
}

/**
 * Get backend server URL
 */
function getBackendUrl() {
  return 'http://localhost:8247';
}

module.exports = {
  startBackendServer,
  stopBackendServer,
  isBackendRunning,
  getBackendUrl
};
