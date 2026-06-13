import { useMemo, useCallback } from 'react';
import { useAuth } from '@/app/providers';

export interface Permission {
  id: string;
  name: string;
  userRule: string;
  actions: string[];
}

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    // Clear cache khi user thay đổi
    if (typeof window !== 'undefined') {
      localStorage.removeItem('permissionsCache');
      localStorage.removeItem('menuState');
    }
    return user?.permissions || [];
  }, [user?.permissions]); // user?.permissions đã đủ để detect user thay đổi

  const hasAction = useMemo(() => {
    return (action: string): boolean => {
      if (!user?.permissions) return false;
      
      return user.permissions.some(permission => 
        permission.actions.includes(action)
      );
    };
  }, [user?.permissions]);

  const hasAnyAction = useMemo(() => {
    return (actions: string[]): boolean => {
      if (!user?.permissions) return false;
      
      return user.permissions.some(permission => 
        permission.actions.some(action => actions.includes(action))
      );
    };
  }, [user?.permissions]);

  const hasAllActions = useMemo(() => {
    return (actions: string[]): boolean => {
      if (!user?.permissions) return false;
      
      const userActions = user.permissions.flatMap(permission => permission.actions);
      return actions.every(action => userActions.includes(action));
    };
  }, [user?.permissions]);

  const getActionsByPermission = useMemo(() => {
    return (permissionName: string): string[] => {
      if (!user?.permissions) return [];
      
      const permission = user.permissions.find(p => p.name === permissionName);
      return permission?.actions || [];
    };
  }, [user?.permissions]);

  // Function để clear tất cả cache
  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('permissionsCache');
      localStorage.removeItem('menuState');
      localStorage.removeItem('sidebarMenuState');
      sessionStorage.clear();
    }
  }, []);

  return {
    permissions,
    hasAction,
    hasAnyAction,
    hasAllActions,
    getActionsByPermission,
    isAuthenticated: !!user,
    clearCache
  };
};
