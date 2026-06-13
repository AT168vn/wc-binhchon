"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaExclamationTriangle } from 'react-icons/fa';

interface RefreshNotificationProps {
  className?: string;
}

export default function RefreshNotification({ className = '' }: RefreshNotificationProps) {
  const [isError, setIsError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const handleRefreshError = (event: CustomEvent) => {
      setIsError(true);
      setMessage(event.detail?.message || 'Không thể làm mới phiên làm việc. Vui lòng đăng nhập lại.');
    };

    // Lắng nghe sự kiện refresh error
    window.addEventListener('refreshError', handleRefreshError as EventListener);

    return () => {
      window.removeEventListener('refreshError', handleRefreshError as EventListener);
    };
  }, [router]);

  // Chỉ hiển thị khi có lỗi
  if (!isError) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
      isError ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    } ${className}`}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 text-white font-medium
        bg-red-600 border-red-700
      `}>
        <FaExclamationTriangle size={16} />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
} 