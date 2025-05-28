import CryptoJS from "crypto-js";
import { startCase } from "lodash";

// Helper functions for encryption and decryption
export const encrypt_data = (data: string, salt: string): string => CryptoJS.AES.encrypt(data, salt).toString();

export const decrypt_data = (cipher_text: string | null, salt: string): string | null => {
  if (!cipher_text) return null;
  const bytes = CryptoJS.AES.decrypt(cipher_text, salt);
  try {
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

// Store item in local storage
export function store_item(key: string, data: any): void {
  const salt = process.env.REACT_APP_SALT || "";
  const value = JSON.stringify(data);
  const encryptedKey = window.btoa(key);
  const encryptedValue = encrypt_data(value, salt);
  window.localStorage.setItem(encryptedKey, encryptedValue);
  window.dispatchEvent(new Event(`${key}`));
}

// Retrieve item from local storage
export function retrieve_item(key: string): any | null {
  const salt = process.env.REACT_APP_SALT || "";
  try {
    const encryptedKey = window.btoa(key);
    const value = window.localStorage.getItem(encryptedKey);
    const decryptedValue = decrypt_data(value, salt);
    return decryptedValue ? JSON.parse(decryptedValue) : null;
  } catch {
    return null;
  }
}

// Clear all items in local storage
export function clear_local_storage(): void {
  try {
    window.localStorage.clear();
  } catch {
    // Handle errors if needed
  }
}

// export function get_uuid(): string {
//   return uuidv4();
// }
export function get_uuid(buf: number = 0): string {
  const now: Date = new Date();
  const time: number = now.getTime();
  let offset: number = now.getTimezoneOffset();
  offset = offset * 60000;
  let dt: string = `${time - offset + buf}`;
  const uuid: string = `${dt.substr(0, 8)}-${dt.substr(8, 4)}-${dt.substr(12, 1)}xxx-yxxx-xxxxxxxxxxxx`.replace(
    /[xy]/g,
    function (c) {
      const r: number = (parseInt(dt, 10) + Math.random() * 16) % 16 | 0;
      dt = Math.floor(parseInt(dt, 10) / 16).toString();
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}
