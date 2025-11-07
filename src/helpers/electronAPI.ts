/**
 * Electron API Bridge
 * This file provides a type-safe interface to communicate with Electron main process
 */

export interface ElectronAPI {
  // App Information
  getAppVersion: () => Promise<string>;
  getBackendUrl: () => Promise<string>;

  // Update Functions
  checkForUpdates: () => Promise<{ success: boolean; message?: string; error?: string }>;
  downloadUpdate: () => Promise<{ success: boolean; message?: string; error?: string }>;
  installUpdate: () => Promise<void>;
  
  // Update Event Listeners
  onUpdateStatus: (callback: (status: any) => void) => void;
  onUpdateProgress: (callback: (progress: any) => void) => void;
  
  // File Dialogs
  showSaveDialog: () => Promise<any>;
  showOpenDialog: () => Promise<any>;
}

/**
 * Check if the app is running in Electron
 */
export const isElectron = (): boolean => {
  return !!(window as any).electronAPI;
};

/**
 * Get the Electron API
 */
export const getElectronAPI = (): ElectronAPI | null => {
  if (isElectron()) {
    return (window as any).electronAPI as ElectronAPI;
  }
  return null;
};

/**
 * Get app version
 */
export const getAppVersion = async (): Promise<string> => {
  const api = getElectronAPI();
  if (api) {
    return await api.getAppVersion();
  }
  return 'Web Version';
};

/**
 * Get backend URL
 */
export const getBackendUrl = async (): Promise<string> => {
  const api = getElectronAPI();
  if (api) {
    return await api.getBackendUrl();
  }
  // Return default backend URL for web version
  return process.env.REACT_APP_API_URL || 'https://www.subrivabilling.com/api/';
};

/**
 * Check for updates
 */
export const checkForUpdates = async (): Promise<{ success: boolean; message?: string }> => {
  const api = getElectronAPI();
  if (api) {
    return await api.checkForUpdates();
  }
  return { success: false, message: 'Not available in web version' };
};

/**
 * Download update
 */
export const downloadUpdate = async (): Promise<{ success: boolean; message?: string }> => {
  const api = getElectronAPI();
  if (api) {
    return await api.downloadUpdate();
  }
  return { success: false, message: 'Not available in web version' };
};

/**
 * Install update (will restart the app)
 */
export const installUpdate = async (): Promise<void> => {
  const api = getElectronAPI();
  if (api) {
    await api.installUpdate();
  }
};

