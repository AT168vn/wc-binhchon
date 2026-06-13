'use client';

import { ReactNode } from 'react';

interface ContentProps {
    children: ReactNode;
}

const Content = ({ children }: ContentProps) => {
    return (
        <div className="flex-1 p-4">
            {children}
        </div>
    );
};

export default Content; 