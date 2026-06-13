import Cookies from 'js-cookie';
import { AUTH_CONFIG } from './constants';

export type PersistedSelectedBranch = { id: number; ten: string };

const cookieOpts = { path: AUTH_CONFIG.COOKIE.path, expires: AUTH_CONFIG.COOKIE.expires };

export function getPersistedSelectedBranch(): PersistedSelectedBranch | null {
  if (typeof window === 'undefined') return null;
  const idStr = Cookies.get(AUTH_CONFIG.COOKIE.selectedBranchIdKey);
  const ten = Cookies.get(AUTH_CONFIG.COOKIE.selectedBranchNameKey);
  const id = idStr ? Number(idStr) : NaN;
  if (!Number.isFinite(id) || id <= 0 || !String(ten ?? '').trim()) return null;
  return { id, ten: String(ten).trim() };
}

export function setPersistedSelectedBranch(id: number, ten: string): void {
  if (typeof window === 'undefined') return;
  if (!Number.isFinite(id) || id <= 0 || !ten.trim()) return;
  Cookies.set(AUTH_CONFIG.COOKIE.selectedBranchIdKey, String(Math.trunc(id)), cookieOpts);
  Cookies.set(AUTH_CONFIG.COOKIE.selectedBranchNameKey, ten.trim(), cookieOpts);
}

export function clearPersistedSelectedBranch(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(AUTH_CONFIG.COOKIE.selectedBranchIdKey, { path: AUTH_CONFIG.COOKIE.path });
  Cookies.remove(AUTH_CONFIG.COOKIE.selectedBranchNameKey, { path: AUTH_CONFIG.COOKIE.path });
}
