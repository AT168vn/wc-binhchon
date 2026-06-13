import axios from 'axios';
import Cookies from 'js-cookie';
import { AUTH_CONFIG, API_CONFIG } from './constants';
import {
  LoginResponse,
  AuthError,
  PmquanlyLoginRequest,
  PmquanlyLoginResponse,
  ApiAuthResponse,
  UserInfo,
} from './types';
import { setupInterceptors } from '../http/interceptors';
import { browserApiFetch } from '../http/browser-api-fetch';
import { encryptToken, getDecryptedToken } from './crypto';
import { decodeJwtPayload, buildUserInfoFromPmquanlyPayload } from './utils';
import type { PmquanlyJwtPayload } from './types';

// Instance axios cho auth (relative URL — gọi qua proxy Next `/api/*`)
const authApi = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

/** Đăng nhập Domain/Hsoft qua route Next.js — proxy đúng `/api/application/*` trên api-auth. */
async function postCmeLogin(
  path: '/api/auth/login_domain' | '/api/auth/login_hsoft',
  body: Record<string, string>,
): Promise<ApiAuthResponse> {
  const res = await browserApiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as ApiAuthResponse & { message?: string };
  if (!res.ok) {
    throw new AuthError(
      data?.Message || data?.message || AUTH_CONFIG.ERRORS.SERVER_ERROR,
      'SERVER_ERROR',
    );
  }
  return data;
}

function mapApiUserInfo(userInfo: ApiAuthResponse['UserInfo']): UserInfo {
  return {
    user_ID: userInfo.User_ID,
    username: userInfo.Username,
    employee_ID: userInfo.Employee_ID,
    hsoft_ID: userInfo.Hsoft_ID,
    hsoft_Account: userInfo.Hsoft_Account,
    displayName: userInfo.DisplayName,
    password: userInfo.Password ?? '',
    source: userInfo.Source,
    email: userInfo.Email,
    status: userInfo.Status,
    application_ID: userInfo.Application_ID,
    application_Name: userInfo.Application_Name,
    siteCompany_ID: userInfo.SiteCompany_ID,
    location: userInfo.Location
      ? {
          id: userInfo.Location.ID,
          code: userInfo.Location.Code,
          name: userInfo.Location.Name,
          address: userInfo.Location.Address,
          province_Name: userInfo.Location.Province_Name,
        }
      : null,
    permissions: userInfo.Permissions.map((permission) => ({
      id: permission.ID,
      name: permission.Name,
      userRule: permission.UserRule,
      actions: permission.Actions,
    })),
  };
}

// Login pmquanly gọi qua Next.js API route (/api/auth/login) để tránh CORS

// Thiết lập interceptors
setupInterceptors(authApi);

/** Đăng nhập bình chọn WC qua bảng sys_tkbinhchon (VIMES DB). */
export async function handleLoginBinhChon(
  suTaikhoan: string,
  matKhau: string,
  onSuccess: (response: LoginResponse) => void,
  onError: (message: string) => void,
): Promise<void> {
  try {
    const normalizedUsername = suTaikhoan.trim();

    if (!normalizedUsername || !matKhau) {
      throw new AuthError(AUTH_CONFIG.ERRORS.MISSING_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    const res = await browserApiFetch('/api/auth/login-binh-chon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        su_taikhoan: normalizedUsername,
        su_matkhau: matKhau,
      }),
    });

    const data = (await res.json().catch(() => null)) as
      | { accessToken?: string; userInfo?: UserInfo; message?: string }
      | null;

    if (!res.ok || !data?.accessToken || !data.userInfo) {
      throw new AuthError(
        data?.message || AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS,
        'INVALID_CREDENTIALS',
      );
    }

    onSuccess({
      accessToken: data.accessToken,
      userInfo: data.userInfo,
    });
  } catch (error) {
    let errorMessage: string;
    if (error instanceof AuthError) {
      errorMessage = error.message;
    } else {
      errorMessage = AUTH_CONFIG.ERRORS.SERVER_ERROR;
    }
    onError(errorMessage);
  }
}

// Hàm login
// loginType: 1 = Đăng nhập tài khoản Domain, 2 = Đăng nhập tài khoản Hsoft
export async function handleLogin(
  username: string,
  password: string,
  onSuccess: (response: LoginResponse) => void,
  onError: (message: string) => void,
  loginType: number = 2
): Promise<void> {
  try {
    const normalizedUsername = username.trim();

    // Validate input
    if (!normalizedUsername || !password) {
      throw new AuthError(AUTH_CONFIG.ERRORS.MISSING_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    const isCmeLoginType = loginType === 1 || loginType === 2;
    if (isCmeLoginType) {
      let loginResponse: ApiAuthResponse;

      if (loginType === 1) {
        loginResponse = await postCmeLogin('/api/auth/login_domain', {
          Username: normalizedUsername,
          Password: password,
          Domain: API_CONFIG.domain,
        });
      } else if (loginType === 2) {
        loginResponse = await postCmeLogin('/api/auth/login_hsoft', {
          Username: normalizedUsername,
          Password: password,
        });
      } else {
        throw new AuthError('Đăng nhập SSO đang tạm thời bị ẩn.', 'API_ERROR');
      }
      if (loginResponse?.Code !== 200 || !loginResponse?.UserInfo) {
        throw new AuthError(loginResponse?.Message || AUTH_CONFIG.ERRORS.SERVER_ERROR, 'SERVER_ERROR');
      }

      const accessToken = loginResponse.UserInfo.AccessToken || loginResponse.Token;
      if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
        throw new AuthError('Token không hợp lệ từ API', 'INVALID_TOKEN');
      }

      const normalizedResponse: LoginResponse = {
        accessToken,
        userInfo: mapApiUserInfo(loginResponse.UserInfo),
      };

      const encryptedToken = encryptToken(accessToken);

      Cookies.set(AUTH_CONFIG.COOKIE.accessTokenKey, encryptedToken, {
        expires: AUTH_CONFIG.COOKIE.expires,
        path: '/',
      });

      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[Auth API] Cookie session đã cập nhật', { hasToken: true });
      }

      onSuccess(normalizedResponse);
      return;
    }

    throw new AuthError('Loại đăng nhập không được hỗ trợ. Chọn Domain hoặc Hsoft.', 'API_ERROR');
  } catch (error) {
    // Xử lý các loại lỗi
    let errorMessage: string;
    if (error instanceof AuthError) {
      errorMessage = error.message;
    } else if (axios.isAxiosError(error)) {
      // Xử lý lỗi từ API
      if (error.response?.data) {
        const apiError = error.response.data as { Message?: string; message?: string };
        errorMessage = apiError.Message || apiError.message || AUTH_CONFIG.ERRORS.SERVER_ERROR;
      } else {
        errorMessage = error.message || AUTH_CONFIG.ERRORS.NETWORK_ERROR;
      }
    } else {
      errorMessage = AUTH_CONFIG.ERRORS.SERVER_ERROR;
    }

    onError(errorMessage);
  }
}

/** Thông báo lỗi đăng nhập sai tài khoản/mật khẩu */
const PMQUANLY_INVALID_CREDENTIALS = 'Tài khoản hoặc mật khẩu không chính xác.';

/**
 * Đăng nhập qua API auth route nội bộ.
 * - Thành công: có accessToken -> lưu token, build UserInfo từ JWT, gọi onSuccess -> cho phép vào trang chủ
 * - Thất bại: hiển thị snackbar "Tài khoản hoặc mật khẩu không chính xác." (hoặc message từ API)
 */
export async function handleLoginPmquanly(
  userName: string,
  password: string,
  onSuccess: (params: { accessToken: string; refreshToken?: string; userInfo: UserInfo }) => void,
  onError: (message: string) => void
): Promise<void> {
  try {
    if (!userName?.trim() || !password) {
      onError(AUTH_CONFIG.ERRORS.MISSING_CREDENTIALS);
      return;
    }
    // API key (X-API-KEY) do route /api/auth/login đọc từ HIS_API_KEY (Docker) hoặc NEXT_PUBLIC_* (build)

    const body: PmquanlyLoginRequest = {
      userName: userName.trim(),
      password,
      terminateSession: true,
      language: 'string',
    };

    const res = await browserApiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as PmquanlyLoginResponse & { message?: string };

    if (!res.ok) {
      onError(data?.message ?? PMQUANLY_INVALID_CREDENTIALS);
      return;
    }

    if (!data?.accessToken) {
      onError(AUTH_CONFIG.ERRORS.SERVER_ERROR);
      return;
    }

    const accessToken = data.accessToken;
    const refreshToken = typeof data.refreshToken === 'string' ? data.refreshToken : undefined;
    const payload = decodeJwtPayload(accessToken) as PmquanlyJwtPayload | null;
    const userInfo = buildUserInfoFromPmquanlyPayload(payload);
    userInfo.username = userName.trim();

    onSuccess({ accessToken, refreshToken, userInfo });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi kết nối. Vui lòng thử lại sau.';
    onError(message);
  }
}

/**
 * Đăng xuất qua API auth route nội bộ: POST /api/auth/logout
 * Gửi Bearer accessToken + body { refreshToken }, không clear/redirect (do AuthProvider xử lý).
 * @param accessTokenOverride — Bearer thô (vd: token vừa login trước khi cookie sync); nếu không có thì đọc từ cookie.
 */
export async function logout(accessTokenOverride?: string | null): Promise<void> {
  if (typeof window === 'undefined') return;

  const trimmedOverride =
    accessTokenOverride != null && String(accessTokenOverride).trim() !== ''
      ? String(accessTokenOverride).trim()
      : null;
  const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
  const accessToken =
    trimmedOverride ?? (encryptedToken ? getDecryptedToken(encryptedToken) : null);
  const refreshToken = Cookies.get(AUTH_CONFIG.COOKIE.refreshTokenKey);

  if (accessToken) {
    try {
      const res = await browserApiFetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken: refreshToken || '' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn('[Auth API] Logout API lỗi:', data?.message ?? res.status);
      }
    } catch (err) {
      console.warn('[Auth API] Logout request thất bại:', err);
    }
  }
}

export default authApi; 