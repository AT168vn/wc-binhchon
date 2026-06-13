import CryptoJS from 'crypto-js';
import { API_CONFIG } from './constants';

// Secret key cho mã hóa - lấy từ constants
const ENCRYPTION_KEY = API_CONFIG.encryptionKey;

/**
 * Mã hóa access token trước khi lưu vào cookie
 * @param token - Access token cần mã hóa
 * @returns Token đã được mã hóa
 */
export const encryptToken = (token: string): string => {
  try {
    if (!token) {
      throw new Error('Token không được để trống');
    }
    
    // Mã hóa token bằng AES
    const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {    
    throw new Error('Không thể mã hóa token');
  }
};

/**
 * Giải mã access token từ cookie
 * @param encryptedToken - Token đã được mã hóa
 * @returns Token đã được giải mã
 */
export const decryptToken = (encryptedToken: string): string => {
  try {
    if (!encryptedToken || typeof encryptedToken !== 'string') {
      throw new Error('Encrypted token không được để trống hoặc không hợp lệ');
    }
    
    // Giải mã token bằng AES
    const decrypted = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    const originalToken = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalToken) {
      throw new Error('Token giải mã không hợp lệ');
    }
    
    return originalToken;
  } catch (error) {    
    throw new Error('Không thể giải mã token');
  }
};

/**
 * Kiểm tra xem token có được mã hóa hay không
 * @param token - Token cần kiểm tra
 * @returns true nếu token đã được mã hóa
 */
export const isTokenEncrypted = (token: string): boolean => {
  try {
    if (!token || typeof token !== 'string' || token.length < 20) {
      return false;
    }
    // JWT thuần (Bearer gốc) — không phải bản AES từ encryptToken
    const asJwt = token.split('.');
    if (asJwt.length === 3 && asJwt.every((p) => p.length > 0)) {
      return false;
    }
    // Không dùng heuristics Base64 (vd. chuỗi 'U2F') — từng mẻ AES có thể không chứa ký tự đó
    const decrypted = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const str = decrypted.toString(CryptoJS.enc.Utf8);
    if (!str || str.length < 20) {
      return false;
    }
    const parts = str.split('.');
    return parts.length === 3 && parts.every((p) => p.length > 0);
  } catch {
    // Nếu không thể giải mã, có thể token chưa được mã hóa hoặc không hợp lệ
    return false;
  }
};

/**
 * Lấy token từ cookie với xử lý mã hóa/giải mã tự động
 * @param encryptedToken - Token từ cookie (có thể đã mã hóa hoặc chưa)
 * @returns Token đã được giải mã hoặc token gốc
 */
export const getDecryptedToken = (encryptedToken: string): string | null => {
  try {
    if (!encryptedToken || typeof encryptedToken !== 'string') {
      return null;
    }
    
    // Kiểm tra xem token có được mã hóa hay không
    if (isTokenEncrypted(encryptedToken)) {
      return decryptToken(encryptedToken);
    }
    
    // Nếu token chưa được mã hóa, trả về token gốc
    return encryptedToken;
  } catch (error) {    
    return null;
  }
}; 