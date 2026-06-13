/* eslint-disable no-console -- module dùng console.debug chỉ khi NODE_ENV=development (client) */
/**
 * Log chỉ trong development (client). Không ghi token hay payload nhạy cảm.
 * Dùng cho stub / placeholder thay vì `console.log` rải rác.
 */
const isClientDev =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'development';

export function devDebug(message: string, context?: Record<string, unknown>): void {
  if (!isClientDev) return;
  if (context && Object.keys(context).length > 0) {
    console.debug(message, context);
  } else {
    console.debug(message);
  }
}
