import axios from 'axios';
import { API_CONFIG } from '../auth/constants';
import { setupInterceptors } from '@/lib/http/interceptors';

// Tạo instance axios chính cho toàn bộ ứng dụng
const apiClient = axios.create({
  baseURL: '',
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  // Không cần withCredentials vì backend không sử dụng HTTP-only cookies
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Chỉ reject khi lỗi server
  }
});

// Thiết lập interceptors
setupInterceptors(apiClient);

export default apiClient; 