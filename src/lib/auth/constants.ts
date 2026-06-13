// API Configuration (client — gọi API qua route Next.js `/api/*`, không cần base URL ngoài)
export const API_CONFIG = {
  // API Key (public — gửi khi BROWSER_DIRECT=true)
  loginKey: process.env.NEXT_PUBLIC_API_KEY || '',

  encryptionKey: process.env.NEXT_PUBLIC_API_KEY || '',

  domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'bvta.vn',
  
  // Login type (2 = Hsoft)
  loginType: 2,
  
  // Timeout cho API calls
  timeout: 10000,
  // Timeout tự động logout khi không thao tác (phút)
  inactivityTimeoutMinutes: Number.parseInt(process.env.NEXT_PUBLIC_TIMEOUT || '30', 10) || 30,
  
  // Headers mặc định - hỗ trợ tiếng Việt
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',    
  },
} as const;

// Auth error codes
export const AUTH_ERRORS = {
  API_ERROR: 'Lỗi kết nối API',
  INVALID_CREDENTIALS: 'Thông tin đăng nhập không chính xác',
  SESSION_EXPIRED: 'Phiên làm việc đã hết hạn',
  SERVER_ERROR: 'Lỗi máy chủ',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Không có quyền truy cập',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  INVALID_TOKEN: 'Token không hợp lệ',
  MISSING_TOKEN: 'Thiếu token xác thực',
} as const;

// Cấu hình Authentication
export const AUTH_CONFIG = {
  // API Configuration
  API: {
    loginKey: API_CONFIG.loginKey,
    domain: API_CONFIG.domain,
    loginType: API_CONFIG.loginType,
    inactivityTimeoutMinutes: API_CONFIG.inactivityTimeoutMinutes,
  },

  // Token Configuration - Đồng bộ với backend
  TOKEN: {
    accessTokenExpiry: 6 * 60 * 60 * 1000, // 6 tiếng
    bufferTime: 2 * 60 * 1000, // 2 phút buffer
  },

  // Cookie Configuration - Tối ưu cho js-cookie
  COOKIE: {
    accessTokenKey: 'accessToken',
    refreshTokenKey: 'refreshToken',
    userKey: 'user',
    usernameKey: 'username',
    returnUrlKey: 'returnUrl',
    /** Cơ sở đã chọn ở màn đăng nhập (ID + tên) — dùng Topbar & modal danh mục. */
    selectedBranchIdKey: 'selectedBranchId',
    selectedBranchNameKey: 'selectedBranchTen',
    expires: 7, // 7 ngày
    path: '/'
  },

  /** Tên hiển thị (sidebar, Account, …) — `NEXT_PUBLIC_TEN_HIEN_THI` trong .env */
  DEFAULT_SITE_NAME: (process.env.NEXT_PUBLIC_TEN_HIEN_THI ?? 'Quản Lý Đào Tạo').trim(),
  DEFAULT_SITE_CODE: 'EHEALTH',
  DEFAULT_SITE_ID: 1,

  // Route Configuration
  ROUTES: {
    login: '/login',
    home: '/wc_bongda',
    publicPaths: ['/login', '/wc_ketqua', '/_next', '/api', '/images', '/icons', '/favicon.ico'],
  },

  // Error messages
  ERRORS: {
    ...AUTH_ERRORS,
    INVALID_CREDENTIALS: 'Tài khoản hoặc mật khẩu không chính xác',
    SESSION_EXPIRED: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại',
    SERVER_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau',
    NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại',
    UNAUTHORIZED: 'Bạn không có quyền truy cập tài nguyên này',
    MISSING_CREDENTIALS: 'Vui lòng nhập đầy đủ thông tin đăng nhập',
  },

  // Success messages
  MESSAGES: {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
  },
} as const;

// Type definitions
export type AuthErrorCode = keyof typeof AUTH_ERRORS;
export type AuthMessageCode = keyof typeof AUTH_CONFIG.MESSAGES; 