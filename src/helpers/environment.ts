/**
 * Environment detection utilities
 */

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && 
         window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
};

export const isWeb = (): boolean => {
  return !isElectron();
};

export const getEnvironment = (): 'electron' | 'web' => {
  return isElectron() ? 'electron' : 'web';
};

export const hasElectronAPI = (): boolean => {
  return typeof window !== 'undefined' && 
         !!(window as any).electronAPI;
};
