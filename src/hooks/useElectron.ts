import { useEffect, useState } from 'react';

// Type definitions for Electron APIs
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
      showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      onMenuEvent: (callback: (event: any, data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      print: () => void;
    };
    nodeAPI?: {
      platform: string;
      arch: string;
      versions: any;
    };
    isElectron?: boolean;
  }
}

interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  getAppVersion: () => Promise<string | null>;
  showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string } | null>;
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] } | null>;
  print: () => void;
  onMenuEvent: (callback: (type: string, data: any) => void) => void;
  removeMenuListeners: () => void;
}

export const useElectron = (): ElectronAPI => {
  const [isElectron] = useState(() => {
    return typeof window !== 'undefined' && window.isElectron === true;
  });

  const [platform] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.electronAPI?.platform || window.nodeAPI?.platform || 'web';
    }
    return 'web';
  });

  const getAppVersion = async (): Promise<string | null> => {
    if (!isElectron || !window.electronAPI) return null;
    try {
      return await window.electronAPI.getAppVersion();
    } catch (error) {
      console.error('Failed to get app version:', error);
      return null;
    }
  };

  const showSaveDialog = async () => {
    if (!isElectron || !window.electronAPI) return null;
    try {
      return await window.electronAPI.showSaveDialog();
    } catch (error) {
      console.error('Failed to show save dialog:', error);
      return null;
    }
  };

  const showOpenDialog = async () => {
    if (!isElectron || !window.electronAPI) return null;
    try {
      return await window.electronAPI.showOpenDialog();
    } catch (error) {
      console.error('Failed to show open dialog:', error);
      return null;
    }
  };

  const print = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.print();
    } else {
      window.print();
    }
  };

  const onMenuEvent = (callback: (type: string, data: any) => void) => {
    if (!isElectron) return;
    
    const handleMenuEvent = (event: CustomEvent) => {
      callback(event.detail.type, event.detail.data);
    };

    window.addEventListener('electron-menu', handleMenuEvent as EventListener);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('electron-menu', handleMenuEvent as EventListener);
    };
  };

  const removeMenuListeners = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.removeAllListeners('menu-new-bill');
      window.electronAPI.removeAllListeners('menu-save-bill');
      window.electronAPI.removeAllListeners('navigate-to');
    }
  };

  return {
    isElectron,
    platform,
    getAppVersion,
    showSaveDialog,
    showOpenDialog,
    print,
    onMenuEvent,
    removeMenuListeners
  };
};

// Utility function to check if running in Electron
export const isElectronApp = (): boolean => {
  return typeof window !== 'undefined' && window.isElectron === true;
};

// Utility function to get platform info
export const getPlatformInfo = () => {
  if (typeof window === 'undefined') return { platform: 'unknown', arch: 'unknown' };
  
  return {
    platform: window.nodeAPI?.platform || 'web',
    arch: window.nodeAPI?.arch || 'unknown',
    versions: window.nodeAPI?.versions || {}
  };
};
