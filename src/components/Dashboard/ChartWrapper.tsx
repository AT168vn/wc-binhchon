"use client";

import { memo, useEffect, useState } from 'react';
import { registerChartJS } from '@/lib/chartConfig';

interface ChartWrapperProps {
  children?: React.ReactNode;
  className?: string;
}

const ChartWrapper = memo<ChartWrapperProps>(({ children, className = "" }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    registerChartJS();
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-md h-full animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md h-full ${className}`}>
      {children}
    </div>
  );
});

ChartWrapper.displayName = 'ChartWrapper';

export default ChartWrapper; 