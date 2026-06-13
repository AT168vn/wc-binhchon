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

export interface LoginResponse {
  userInfo: UserInfo;
  accessToken: string;
}

export interface JWTPayload {
  exp: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export class AuthError extends Error {
  code: keyof typeof AUTH_ERRORS;

  constructor(message: string, code: keyof typeof AUTH_ERRORS) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export type AuthErrorCode = keyof typeof AUTH_ERRORS;

export interface UserInfoFromToken {
  sub?: string;
  exp?: number;
  [key: string]: unknown;
}
