// Simple encryption/decryption utilities for session storage
class SessionStorageEncryption {
  private static readonly SECRET_KEY = 'your-app-secret-key'; // In production, use environment variable
  
  // Simple encryption using base64 (for basic protection)
  // For production, consider using crypto-js or similar library
  static encrypt(data: any): string {
    try {
      if (!data) {
        console.warn('Encryption: No data provided');
        return '';
      }
      const jsonString = JSON.stringify(data);
      const encrypted = btoa(jsonString); // Base64 encoding
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
      const jsonString = atob(encryptedData); // Base64 decoding
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
