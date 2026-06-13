// Global refresh state manager để tránh duplicate API calls
class RefreshManager {
  private static instance: RefreshManager;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): RefreshManager {
    if (!RefreshManager.instance) {
      RefreshManager.instance = new RefreshManager();
    }
    return RefreshManager.instance;
  }

  isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  async executeRefresh(refreshFunction: () => Promise<boolean>): Promise<boolean> {
    // Nếu đang refresh, trả về promise hiện tại
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Bắt đầu refresh mới
    this.isRefreshing = true;
    this.refreshPromise = refreshFunction()
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}

export const refreshManager = RefreshManager.getInstance(); 