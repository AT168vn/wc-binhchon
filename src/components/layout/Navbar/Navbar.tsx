'use client';

import { AppBar, Box, Toolbar, LinearProgress } from '@mui/material';
import { menuItems } from '@/config/menu';
import Image from 'next/image';
import NavList from '@/components/layout/Navbar/NavList';
import Account from '@/components/layout/Account';
import Link from 'next/link';
import { useDebouncedNavigation } from '@/hooks/useDebouncedNavigation';
import { usePermissions } from '@/hooks/usePermissions';
import { filterMenuByPermissions } from '@/lib/menu/permissionFilter';

const Navbar = () => {
  const { isNavigating } = useDebouncedNavigation();
  const { hasAction } = usePermissions();
  const filteredMenuItems = filterMenuByPermissions(menuItems, hasAction);

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#007BFF' }}>
      <Toolbar variant="dense" sx={{ justifyContent: 'flex-start', minHeight: 54, height: 54, px: 2 }}>
        <Link href="/" passHref>
          <Box display="flex" alignItems="center">
            <Image 
              src="/images/newlogo_white.png" 
              alt="Logo" 
              width={48}
              height={48}
              style={{
                width: '48px',
                height: 'auto',
                marginRight: '8px'
              }}
              className="object-contain"
            />
          </Box>
        </Link>
        <NavList menuItems={filteredMenuItems} />
        {/* <NavItem
          label="Menu 2"
          items={[
            { label: 'Danh sách hiện diện', onClick: () => alert('Clicked: Danh sách hiện diện') },
            {
              label: 'Đánh giá tình trạng dinh dưỡng',
              children: [
                { label: 'Người Bình thường', onClick: () => alert('Clicked: Người Bình thường') },
                { label: 'Người Mang thai', onClick: () => alert('Clicked: Người Mang thai') },
                { label: 'Nhi khoa', onClick: () => alert('Clicked: Nhi khoa') },
              ],
            },
          ]}
        />  */}
        <Account />
      </Toolbar>
      {isNavigating && <LinearProgress color="secondary" />}
    </AppBar>
  );
};

export default Navbar;
