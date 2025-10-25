// Centralized console logging utility
// Disables console logs in production builds

const isDevelopment = process.env.NODE_ENV === 'development';

export const consoleLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const consoleWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

export const consoleError = (...args: any[]) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

export const consoleInfo = (...args: any[]) => {
  if (isDevelopment) {
    console.info(...args);
  }
};

export const consoleDebug = (...args: any[]) => {
  if (isDevelopment) {
    console.debug(...args);
  }
};

// Production-safe logging that always works
export const logError = (...args: any[]) => {
  console.error(...args);
};

export const logInfo = (...args: any[]) => {
  console.info(...args);
};
