import { AUTH_CONFIG } from './constants';
import { LoginResponse, AuthError, UserInfo } from './types';
import { browserApiFetch } from '../http/browser-api-fetch';

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
    const errorMessage =
      error instanceof AuthError ? error.message : AUTH_CONFIG.ERRORS.SERVER_ERROR;
    onError(errorMessage);
  }
}
