'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { getDecryptedToken } from '@/lib/auth/crypto';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthState = () => {
      try {
        const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
        const accessToken = encryptedToken ? getDecryptedToken(encryptedToken) : null;
        const user = Cookies.get(AUTH_CONFIG.COOKIE.userKey);        
        
        if (accessToken && user) {
          router.replace('/wc_bongda');
        } else {
          router.replace('/login');
        }
      } catch (error) {        
        router.replace('/login');
      }
    };

    checkAuthState();
  }, [router]);

  return <div className="min-h-screen" />;
}