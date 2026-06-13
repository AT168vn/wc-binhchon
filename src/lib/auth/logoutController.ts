/** Khớp `AuthLogoutOptions` trong `AuthProvider` — tránh import vòng từ lib → app. */
type LogoutOptions = { accessTokenOverride?: string };

type LogoutFn = (redirectToLogin?: boolean, options?: LogoutOptions) => Promise<void>;

let logoutHandler: LogoutFn | null = null;
let logoutInFlight = false;

/** AuthProvider gắn hàm logout thật (gọi API + clear + redirect). */
export function setLogoutHandler(fn: LogoutFn | null): void {
  logoutHandler = fn;
}

/**
 * Dùng khi phiên hết hạn/401 (axios): gọi cùng luồng với đăng xuất thủ công, không dùng CustomEvent.
 * Chống gọi chồng nhiều 401 cùng lúc.
 */
export function requestSessionEndFrom401(): void {
  if (typeof window === 'undefined' || logoutInFlight) return;
  const run = logoutHandler;
  if (!run) return;
  logoutInFlight = true;
  void run(true).finally(() => {
    logoutInFlight = false;
  });
}
