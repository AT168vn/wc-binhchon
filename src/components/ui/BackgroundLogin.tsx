'use client';

import type { ReactNode } from 'react';
import '@/styles/BackgroundLogin.css';

export default function BackgroundLogin({
  className = '',
  contentClassName = '',
  backgroundImage,
  children,
}: {
  className?: string;
  contentClassName?: string;
  backgroundImage?: string;
  children?: ReactNode;
}) {
  const usePhotoBackground = Boolean(backgroundImage?.trim());

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${
        usePhotoBackground ? 'bg-[#0a1628]' : 'tamAnhAuthGradient'
      } ${className}`}
      style={
        usePhotoBackground
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      {!usePhotoBackground ? (
        <div className="tamAnhAuthStarsContainer z-[1]" aria-hidden>
          <div className="tamAnhAuthStars" />
        </div>
      ) : null}
      {usePhotoBackground ? (
        <div className="absolute inset-0 z-[1] bg-black/25" aria-hidden />
      ) : null}
      {children != null ? (
        <div className={`relative z-10 flex min-h-0 min-w-0 flex-1 flex-col ${contentClassName}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
