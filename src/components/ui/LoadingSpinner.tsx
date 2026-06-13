import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
    } else {
        setShouldRender(false);
    }

  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div className="absolute inset-0 z-[9999] flex items-start justify-center" style={{ paddingTop: '15vh' }}>
      <div className="flex items-center justify-center transition-opacity duration-300 ease-in-out">
        <Image src="/images/loading.gif" alt="loading..." width={60} height={60} unoptimized priority className="opacity-90"/>
      </div>
    </div>
  );
};

export default LoadingSpinner;
