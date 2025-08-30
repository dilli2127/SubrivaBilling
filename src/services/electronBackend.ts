/**
 * Electron Backend Service
 * Handles communication between the React frontend and the embedded backend server
 */

// Type declarations are in src/hooks/useElectron.ts

class ElectronBackendService {
  private backendUrl: string | null = null;
  private isElectron: boolean = false;

  constructor() {
    this.isElectron = this.checkIfElectron();
    this.initializeBackendUrl();
  }

  /**
   * Check if the app is running in Electron
   */
  private checkIfElectron(): boolean {
    return !!(window && window.electronAPI);
  }

  /**
   * Initialize the backend URL
   */
  private async initializeBackendUrl(): Promise<void> {
    if (this.isElectron && window.electronAPI) {
      try {
        this.backendUrl = await window.electronAPI.getBackendUrl();
        console.log('✅ Backend URL initialized:', this.backendUrl);
      } catch (error) {
        console.error('❌ Failed to get backend URL:', error);
        // Fallback to default local URL
        this.backendUrl = 'http://localhost:8247';
      }
    } else {
      // If not in Electron, use the development server URL or production API
      this.backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    }
  }

  /**
   * Get the backend base URL
   */
  public async getBackendUrl(): Promise<string> {
    if (!this.backendUrl) {
      await this.initializeBackendUrl();
    }
    return this.backendUrl || 'http://localhost:8247';
  }

  /**
   * Get the full API URL with path
   */
  public async getApiUrl(path: string = ''): Promise<string> {
    const baseUrl = await this.getBackendUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}/api${cleanPath}`;
  }

  /**
   * Check if running in Electron
   */
  public isElectronApp(): boolean {
    return this.isElectron;
  }

  /**
   * Wait for backend to be ready
   */
  public async waitForBackend(timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const backendUrl = await this.getBackendUrl();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Backend is ready');
          return true;
        }
      } catch (error) {
        // Backend not ready yet, continue waiting
      }

      // Wait 500ms before trying again
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.warn('⚠️ Backend did not become ready within timeout');
    return false;
  }

  /**
   * Get app version (Electron only)
   */
  public async getAppVersion(): Promise<string> {
    if (this.isElectron && window.electronAPI) {
      try {
        return await window.electronAPI.getAppVersion();
      } catch (error) {
        console.error('Failed to get app version:', error);
        return 'Unknown';
      }
    }
    return 'Web Version';
  }

  /**
   * Get platform info (Electron only)
   */
  public getPlatform(): string {
    if (this.isElectron && window.electronAPI) {
      return window.electronAPI.platform;
    }
    return 'web';
  }
}

// Create and export a singleton instance
const electronBackendService = new ElectronBackendService();
export default electronBackendService;

// Export the class for testing purposes
export { ElectronBackendService };
