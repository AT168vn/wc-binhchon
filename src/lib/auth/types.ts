// Types cho authentication
import { AUTH_ERRORS } from '@/lib/auth/constants';

export interface UserInfo {
  user_ID: string;
  username: string;
  employee_ID: number | null;
  displayName: string;
  password: string;
  source: number;
  email: string;
  status: boolean;
  application_ID: string;
  application_Name: string | null;
  hsoft_ID: string | null;
  hsoft_Account: string;
  location: {
    id: string;
    code: string;
    name: string;
    address: string;
    province_Name: string | null;
  } | null;
  siteCompany_ID: string;
  permissions: {
    id: string;
    name: string;
    userRule: string;
    actions: string[];
  }[];
}

export interface LoginRequest {
  username: string;
  password: string;
  loginType: number;
  key: string;
  domain?: string;
  email?: string;
}

export interface LoginResponse {
  userInfo: UserInfo;
  accessToken: string;
}

/** Request/Response cho API đăng nhập nội bộ */
export interface PmquanlyLoginRequest {
  userName: string;
  password: string;
  terminateSession: boolean;
  language: string;
}

export interface PmquanlyLoginResponse {
  accessToken: string;
  refreshToken: string;
}

/** Payload JWT từ pmquanly (sau khi decode) */
export interface PmquanlyJwtPayload {
  nameid?: string;
  email?: string;
  unique_name?: string;
  userid?: string;
  systemrole?: string;
  fullname?: string;
  nbf?: number;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
}

// Response từ API auth
export interface ApiAuthResponse {
  Code: number;
  Token: string;
  UserInfo: {
    User_ID: string;
    Username: string;
    Employee_ID: number | null;
    Hsoft_ID: string | null;
    Hsoft_Account: string;
    DisplayName: string;
    Password: string | null;
    Source: number;
    Email: string;
    Status: boolean;
    Application_ID: string;
    Application_Name: string | null;
    SiteCompany_ID: string;
    AccessToken: string;
    Location: {
      ID: string;
      Code: string;
      Name: string;
      Address: string;
      Province_Name: string | null;
    } | null;
    Permissions: {
      ID: string;
      Name: string;
      UserRule: string;
      Actions: string[];
    }[];
  };
  Message: string;
}

// Request cho Domain login
export interface DomainLoginRequest {
  Key: string;
  Username: string;
  Password: string;
  LoginType: number;
  Domain: string;
}

// Request cho Hsoft login
export interface HsoftLoginRequest {
  Key: string;
  Username: string;
  Password: string;
}

export interface JWTPayload {
  exp: number;
  iat: number;
  sub?: string;
  [key: string]: unknown;
}

export interface UserInfoFromToken {
  exp: number;
  iat: number;
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

export interface ApiErrorResponse {
  message?: string;
  code?: string;
  status?: number;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: keyof typeof AUTH_ERRORS = 'API_ERROR'
  ) {
    super(message);
    this.name = 'AuthError';
  }
} 