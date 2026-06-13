'use client';

import { useCallback, useEffect, useState } from 'react';
import { browserApiFetch } from '@/lib/http/browser-api-fetch';

/**
 * Ctrl+Shift+Alt+T: bật/tắt toàn bộ nút LogAPI trong modal.
 * Mặc định ẩn; khi `modalOpen` chuyển sang true (mở modal) thì tắt lại thanh và đóng preview / log phiên.
 */
export type PendingApiApply =
  | null
  | { kind: 'save' }
  | { kind: 'delete'; id: number | string; nhom?: number };

export type ApiSessionLogEntry = {
  id: string;
  at: number;
  method: string;
  path: string;
  bodyPreview: string | null;
};

const MAX_SESSION_LOGS = 120;

export function useModalApiLog(modalOpen?: boolean) {
  const [showLogApiToolbar, setShowLogApiToolbar] = useState(false);
  const [apiPayloadModalOpen, setApiPayloadModalOpen] = useState(false);
  const [sessionLogModalOpen, setSessionLogModalOpen] = useState(false);
  const [pendingApiApply, setPendingApiApply] = useState<PendingApiApply>(null);
  const [apiSessionLogs, setApiSessionLogs] = useState<ApiSessionLogEntry[]>([]);

  const clearSessionLogs = useCallback(() => setApiSessionLogs([]), []);

  useEffect(() => {
    if (!modalOpen) return;
    setShowLogApiToolbar(false);
    setApiPayloadModalOpen(false);
    setSessionLogModalOpen(false);
    setPendingApiApply(null);
  }, [modalOpen]);

  const appendLog = useCallback((entry: Omit<ApiSessionLogEntry, 'id'> & { id?: string }) => {
    setApiSessionLogs((prev) => {
      const id = entry.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return [...prev.slice(-(MAX_SESSION_LOGS - 1)), { ...entry, id }];
    });
  }, []);

  const loggedFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let method = (init?.method ?? 'GET').toUpperCase();
      let path = '';
      if (typeof input === 'string') {
        path = input;
      } else if (typeof URL !== 'undefined' && input instanceof URL) {
        path = input.href;
      } else if (typeof Request !== 'undefined' && input instanceof Request) {
        path = input.url;
        if (!init?.method) method = (input.method || 'GET').toUpperCase();
      } else {
        path = String(input);
      }

      let bodyPreview: string | null = null;
      const b = init?.body;
      if (b != null) {
        if (typeof b === 'string') {
          bodyPreview = b.length > 8000 ? `${b.slice(0, 8000)}\n…` : b;
        } else {
          bodyPreview = '[FormData / Blob / ReadableStream]';
        }
      }

      appendLog({ at: Date.now(), method, path, bodyPreview });
      return browserApiFetch(input as RequestInfo | URL, init);
    },
    [appendLog]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.code === 'KeyT') {
        e.preventDefault();
        setShowLogApiToolbar((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closePreview = useCallback(() => {
    setApiPayloadModalOpen(false);
    setPendingApiApply(null);
  }, []);

  const openPreviewReadOnly = useCallback(() => {
    setPendingApiApply(null);
    setApiPayloadModalOpen(true);
  }, []);

  return {
    showLogApiToolbar,
    apiPayloadModalOpen,
    setApiPayloadModalOpen,
    sessionLogModalOpen,
    setSessionLogModalOpen,
    pendingApiApply,
    setPendingApiApply,
    closePreview,
    openPreviewReadOnly,
    apiSessionLogs,
    clearSessionLogs,
    loggedFetch,
  };
}
