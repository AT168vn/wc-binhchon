'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { CustomSnackbar } from '@/components/ui/CustomSnackbar';

type Severity = 'success' | 'error';

type AppSnackbarContextValue = {
    showSnackbar: (message: string, severity: Severity) => void;
    hideSnackbar: () => void;
};

const AppSnackbarContext = createContext<AppSnackbarContextValue | null>(null);

/** Một snackbar chung: góc phải layout, ngay dưới topbar cố định 72px (cùng khu vực avatar). */
export function AppSnackbarProvider({ children }: { children: React.ReactNode }) {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as Severity,
    });

    const showSnackbar = useCallback((message: string, severity: Severity) => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    /** Khớp CustomSnackbar: dưới topbar 72px + khe; z cao để không bị header/modal che. */
    const layoutSnackbarSx: SxProps<Theme> = {
        top: 80,
        mt: 0,
        mr: 2,
        left: 'auto',
        zIndex: 15000,
    };

    return (
        <AppSnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
            {children}
            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
                snackbarSx={layoutSnackbarSx}
            />
        </AppSnackbarContext.Provider>
    );
}

export function useAppSnackbar(): AppSnackbarContextValue {
    const ctx = useContext(AppSnackbarContext);
    if (!ctx) {
        throw new Error('useAppSnackbar chỉ dùng bên trong AppSnackbarProvider');
    }
    return ctx;
}
