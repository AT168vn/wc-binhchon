'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { getDecryptedToken } from '@/lib/auth/crypto';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    try {
      const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
      const accessToken = encryptedToken ? getDecryptedToken(encryptedToken) : null;
      const user = Cookies.get(AUTH_CONFIG.COOKIE.userKey);

      if (accessToken && user) {
        router.replace(AUTH_CONFIG.ROUTES.home);
      } else {
        router.replace(AUTH_CONFIG.ROUTES.login);
      }
    } catch {
      router.replace(AUTH_CONFIG.ROUTES.login);
    }
  }, [router]);

  return <div className="min-h-screen" />;
}
