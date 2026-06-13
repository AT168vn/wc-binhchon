'use client';
import * as React from 'react';
import { Box, Button, Popover, Typography, Stack } from '@mui/material';

import { useAuth } from '@/app/providers';
import { AUTH_ERRORS } from '@/lib/auth/constants';
import { useSnackbar } from '@/components/ui/CustomSnackbar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { isAxiosError } from 'axios';
import { AUTH_CONFIG } from '@/lib/auth/constants';

export default function Account() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const siteName = 'Cơ sở: ' + AUTH_CONFIG.DEFAULT_SITE_NAME;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = React.useCallback(async () => {
    try {
      await logout();
      // Không cần router.push vì đã được xử lý trong AuthProvider
    } catch (error) {
      if (isAxiosError(error)) {
        showSnackbar(error.response?.data?.message || AUTH_ERRORS.SERVER_ERROR, 'error');
      } else {
        showSnackbar(AUTH_ERRORS.SERVER_ERROR, 'error');
      }
    }
  }, [logout, showSnackbar]);

  const open = Boolean(anchorEl);
  const id = open ? 'account-popover' : undefined;

  return (
    <div>
      <Button
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          minWidth: 'auto',
          padding: 0.5,
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ color: 'inherit' }}>
            {siteName}
          </Typography>
          <ExitToAppIcon />
        </Stack>
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            onClick={handleLogoutClick}
            startIcon={<ExitToAppIcon />}
            fullWidth
            color="error"
          >
            Đăng xuất
          </Button>
        </Box>
      </Popover>
    </div>
  );
}
