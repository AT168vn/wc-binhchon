'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '@/app/providers';
import { CustomSnackbar, useSnackbar } from '@/components/ui/CustomSnackbar';
import BackgroundLogin from '@/components/ui/BackgroundLogin';
import { handleLoginBinhChon } from '@/lib/auth/api';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { validateAndCleanupTokens } from '@/lib/auth/utils';

function getAppVersionPlain(): string {
  const raw = (process.env.NEXT_PUBLIC_VERSION || '0.0.1').trim();
  if (!raw) return '0.0.1';
  return raw.replace(/^v\s*/i, '');
}

function getLoginSystemLine(): string {
  return process.env.NEXT_PUBLIC_TEN_VERSION?.trim() || 'Tên Dự Án';
}

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const { login: setAuth } = useAuth();

  useEffect(() => {
    try {
      validateAndCleanupTokens();
    } catch (error) {
      console.warn('[Login] validateAndCleanupTokens:', error);
    }
    return () => {
      setIsLoading(false);
      setIsSubmitted(false);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || isSubmitted) return;

    if (!username.trim() || !password) {
      showSnackbar(AUTH_CONFIG.ERRORS.MISSING_CREDENTIALS, 'error');
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);

    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(false);
      showSnackbar('Yêu cầu đăng nhập bị timeout. Vui lòng thử lại.', 'error');
    }, 30000);

    try {
      await handleLoginBinhChon(
        username.trim(),
        password,
        (response) => {
          setAuth(response.accessToken, response.userInfo);
          Cookies.remove(AUTH_CONFIG.COOKIE.returnUrlKey);
          window.location.href = AUTH_CONFIG.ROUTES.home;
          window.clearTimeout(timeoutId);
        },
        (errorMessage) => {
          window.clearTimeout(timeoutId);
          showSnackbar(errorMessage, 'error');
          setIsLoading(false);
          setIsSubmitted(false);
        },
      );
    } catch {
      window.clearTimeout(timeoutId);
      showSnackbar(AUTH_CONFIG.ERRORS.SERVER_ERROR, 'error');
      setIsLoading(false);
      setIsSubmitted(false);
    }
  };

  return (
    <BackgroundLogin
      backgroundImage="/images/bang-dau5.jpg"
      className="min-h-dvh w-full"
      contentClassName="relative flex min-h-screen items-center justify-center px-4 py-8"
    >
      {isLoading ? <div className="absolute inset-0 z-20 bg-black/15" /> : null}

      <div className={`w-full max-w-md rounded-lg bg-white p-8 shadow-xl ${isLoading ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="mb-6 text-center">
          <div className="flex items-center gap-1.5 text-[32px] font-bold text-[#0000FF] antialiased sm:text-[11px]">
            <span className="h-px min-w-[1rem] flex-1 bg-[#7d9aad]" aria-hidden />
            <span className="shrink-0">{getLoginSystemLine()}</span>
            <span className="h-px min-w-[1rem] flex-1 bg-[#7d9aad]" aria-hidden />
          </div>
          <p className="mt-1 text-[14px] font-semibold text-[#0000FF] antialiased sm:text-[11px]">
            {getAppVersionPlain()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <input
            type="text"
            placeholder="Tài khoản bình chọn"
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 p-2 text-sm font-medium text-white transition duration-300 hover:bg-blue-700 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </BackgroundLogin>
  );
};

export default LoginForm;
