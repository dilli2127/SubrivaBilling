import CryptoJS from 'crypto-js';

// AES encryption/decryption utilities for session storage
class SessionStorageEncryption {
  // In production, use environment variable
  private static readonly SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'subriva-default-secret-key-change-in-production';
  
  // AES encryption for sensitive data
  static encrypt(data: any): string {
    try {
      if (!data) {
        console.warn('Encryption: No data provided');
        return '';
      }
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return '';
    }
  }
  
  static decrypt(encryptedData: string): any {
    try {
      if (!encryptedData || encryptedData.trim() === '') {
        console.warn('Decryption: No encrypted data provided');
        return null;
      }
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      const jsonString = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        console.error('Decryption resulted in empty string');
        return null;
      }
      
      const decrypted = JSON.parse(jsonString);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
  
  // Store encrypted data
  static setItem(key: string, data: any): void {
    const encrypted = this.encrypt(data);
    sessionStorage.setItem(key, encrypted);
  }
  
  // Retrieve and decrypt data
  static getItem(key: string): any {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }
  
  // Remove item
  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
  
  // Clear all
  static clear(): void {
    sessionStorage.clear();
  }
}

export default SessionStorageEncryption;
