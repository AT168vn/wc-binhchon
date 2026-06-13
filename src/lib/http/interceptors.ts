import { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '../auth/constants';
import { getDecryptedToken } from '../auth/crypto';
import { requestSessionEndFrom401 } from '../auth/logoutController';

export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
  // Request interceptor để thêm token vào header
  axiosInstance.interceptors.request.use(
    async (config) => {
      const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
      
      if (encryptedToken) {
        // Giải mã token trước khi sử dụng
        const accessToken = getDecryptedToken(encryptedToken);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug('[Interceptor] Bearer header đã gắn', {
              url: config.url,
              hasToken: true,
            });
          }
        } else {
          // Log warning nếu không thể giải mã token
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.warn('[Interceptor] Không thể giải mã token từ cookie cho request:', config.url);
          }
        }
      } else {
        // Log warning nếu không có token
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.warn('[Interceptor] Không tìm thấy token trong cookie cho request:', config.url);
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor để xử lý lỗi chung
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Nếu không có response hoặc lỗi mạng, thử lại request
      if (!error.response) {
        const retryCount = (originalRequest._retryCount || 0) + 1;
        if (retryCount <= 3) {
          originalRequest._retryCount = retryCount;
          await new Promise(resolve => setTimeout(resolve, 1000));
          return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
      
      // 401: cùng luồng đăng xuất với AuthProvider (API logout + clear + /login), không dùng CustomEvent
      if (error.response?.status === 401) {
        requestSessionEndFrom401();
      }
      
      return Promise.reject(error);
    }
  );
}; 