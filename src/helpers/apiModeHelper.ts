/**
 * API Mode Helper
 * Manages offline/online mode settings and provides appropriate API URL
 * Note: Offline mode is only available in Electron app
 */

import { isElectron } from './environment';

export type ApiMode = 'online' | 'offline';

export interface ApiModeConfig {
  mode: ApiMode;
  onlineUrl: string;
  offlineUrl: string;
}

const API_MODE_KEY = 'api_mode_config';

// Default configuration
const DEFAULT_CONFIG: ApiModeConfig = {
  mode: 'online',
  onlineUrl: process.env.REACT_APP_API_URL || 'https://api.subrivabilling.com',
  offlineUrl: 'http://localhost:8249',
};

/**
 * Check if offline mode is supported (Electron only)
 */
export const isOfflineModeSupported = (): boolean => {
  return isElectron();
};

/**
 * Get the current API mode configuration
 * Note: For web apps, always returns online mode
 */
export const getApiModeConfig = (): ApiModeConfig => {
  // Web apps always use online mode
  if (!isElectron()) {
    return {
      ...DEFAULT_CONFIG,
      mode: 'online',
    };
  }

  try {
    const stored = localStorage.getItem(API_MODE_KEY);
    if (stored) {
      const config = JSON.parse(stored) as ApiModeConfig;
      // Ensure URLs are present, use defaults if missing
      return {
        mode: config.mode || 'online',
        onlineUrl: config.onlineUrl || DEFAULT_CONFIG.onlineUrl,
        offlineUrl: config.offlineUrl || DEFAULT_CONFIG.offlineUrl,
      };
    }
  } catch (error) {
    console.error('Error reading API mode config:', error);
  }
  return DEFAULT_CONFIG;
};

/**
 * Set the API mode configuration
 * Note: Offline mode can only be set in Electron app
 */
export const setApiModeConfig = (config: Partial<ApiModeConfig>): void => {
  // Prevent setting offline mode in web apps
  if (!isElectron() && config.mode === 'offline') {
    console.warn('Offline mode is only available in Electron app. Ignoring mode change.');
    return;
  }

  try {
    const currentConfig = getApiModeConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem(API_MODE_KEY, JSON.stringify(newConfig));
    
    // Log the change for debugging
    console.log('API Mode updated:', {
      mode: newConfig.mode,
      activeUrl: newConfig.mode === 'online' ? newConfig.onlineUrl : newConfig.offlineUrl,
      environment: isElectron() ? 'Electron' : 'Web',
    });
  } catch (error) {
    console.error('Error saving API mode config:', error);
  }
};

/**
 * Get the current active API URL based on mode
 * Note: Web apps always use online URL
 */
export const getActiveApiUrl = (): string => {
  const config = getApiModeConfig();
  
  // Web apps always use online mode
  if (!isElectron()) {
    return config.onlineUrl;
  }
  
  return config.mode === 'online' ? config.onlineUrl : config.offlineUrl;
};

/**
 * Check if currently in offline mode
 */
export const isOfflineMode = (): boolean => {
  const config = getApiModeConfig();
  return config.mode === 'offline';
};

/**
 * Check if currently in online mode
 */
export const isOnlineMode = (): boolean => {
  const config = getApiModeConfig();
  return config.mode === 'online';
};

/**
 * Switch to offline mode
 */
export const switchToOfflineMode = (): void => {
  setApiModeConfig({ mode: 'offline' });
};

/**
 * Switch to online mode
 */
export const switchToOnlineMode = (): void => {
  setApiModeConfig({ mode: 'online' });
};

/**
 * Update online URL
 */
export const updateOnlineUrl = (url: string): void => {
  setApiModeConfig({ onlineUrl: url });
};

/**
 * Update offline URL
 */
export const updateOfflineUrl = (url: string): void => {
  setApiModeConfig({ offlineUrl: url });
};

