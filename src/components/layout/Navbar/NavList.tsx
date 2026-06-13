'use client';
import NavItem from './NavItem';
import { useDebouncedNavigation } from '@/hooks/useDebouncedNavigation';
import { SubMenuItem, MenuItem } from '@/config/menu';

interface NavListProps {
  menuItems: MenuItem[];
}

const NavList = ({ menuItems }: NavListProps) => {
  const { callPage } = useDebouncedNavigation();

  const collectSubItems = (subItems?: SubMenuItem[]): { label: string; onClick: () => void }[] => {
    if (!subItems) return [];

    const result: { label: string; onClick: () => void }[] = [];

    const traverse = (items: SubMenuItem[]) => {
      items.forEach((sub) => {
        result.push({
          label: sub.title.trim(),
          onClick: () => callPage(sub.path),
        });

        if (sub.subItems && sub.subItems.length > 0) {
          traverse(sub.subItems);
        }
      });
    };

    traverse(subItems);
    return result;
  };

  const navList = menuItems
    .map((item) => {
      const childItems = collectSubItems(item.subItems);
      if (childItems.length === 0) return null;

      return <NavItem key={item.path} label={item.title.trim()} link={item.path.trim()} items={childItems} />;
    })
    .filter(Boolean);

  return <>{navList}</>;
};

export default NavList;
