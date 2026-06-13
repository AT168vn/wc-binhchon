import { MenuItem, SubMenuItem } from '@/config/menu';

/**
 * Kiểm tra xem một menu item có thể hiển thị (không còn check permission)
 */
export const canShowMenuItem = (
  _item: MenuItem | SubMenuItem,
  _hasAction: (action: string) => boolean
): boolean => {
  return true;
};

/**
 * Lọc menu items dựa trên permissions
 */
export const filterMenuByPermissions = (
  menuItems: MenuItem[],
  hasAction: (action: string) => boolean
): MenuItem[] => {
  // Clear menu cache để đảm bảo menu được filter lại mỗi lần
  if (typeof window !== 'undefined') {
    localStorage.removeItem('menuState');
  }
  
  return menuItems
    .filter(item => canShowMenuItem(item, hasAction))
    .map(item => ({
      ...item,
      subItems: item.subItems 
        ? filterSubMenuByPermissions(item.subItems, hasAction)
        : undefined
    }))
    .filter(item => {
      // Chỉ hiển thị menu cha nếu có ít nhất một submenu con
      if (item.subItems && item.subItems.length === 0) {
        return false;
      }
      return true;
    });
};

/**
 * Lọc sub menu items dựa trên permissions
 */
export const filterSubMenuByPermissions = (
  subItems: SubMenuItem[],
  hasAction: (action: string) => boolean
): SubMenuItem[] => {
  return subItems
    .filter(item => canShowMenuItem(item, hasAction))
    .map(item => ({
      ...item,
      subItems: item.subItems 
        ? filterSubMenuByPermissions(item.subItems, hasAction)
        : undefined
    }))
    .filter(item => {
      // Chỉ hiển thị submenu nếu có ít nhất một submenu con hoặc không có submenu con
      if (item.subItems && item.subItems.length === 0) {
        return false;
      }
      return true;
    });
};
