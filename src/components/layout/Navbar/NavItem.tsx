"use client";

import { Box, Button, Popper, Paper, ClickAwayListener, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';
import LoadingLink from '@/components/ui/LoadingLink';

interface SubItem {
  label: string;
  link?: string;
  onClick?: () => void;
  children?: SubItem[];
}

interface NavItemProps {
  label: string;
  link?: string;
  items: SubItem[];
  disableClick?: boolean;
}

const NavItem = ({ label, items, disableClick }: NavItemProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subAnchorEl, setSubAnchorEl] = useState<null | HTMLElement>(null);
  const [submenuItems, setSubmenuItems] = useState<SubItem[] | null>(null);

  const open = Boolean(anchorEl);
  const subOpen = Boolean(subAnchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubAnchorEl(null);
    setSubmenuItems(null);
  };

  const handleSubOpen = (
    event: React.MouseEvent<HTMLElement>,
    children: SubItem[]
  ) => {
    setSubAnchorEl(event.currentTarget);
    setSubmenuItems(children);
  };

  return (
    <Box
      onMouseLeave={handleClose}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        px: 1,
        alignItems: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#1976d2" },
      }}
    >
      <Button
        onMouseEnter={handleOpen}
        endIcon={<ArrowDropDownIcon />}
        sx={{ color: "white", textTransform: "none", height: 54 }}
      >
        {label}
      </Button>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        disablePortal
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              backgroundColor: "#0d47a1",
              color: "white",
              p: 0,
              minWidth: 240,
              borderRadius: 0,
            }}
          >
            {items.map((item, index) => {
              const Content = (
                <Box
                  key={item.label}
                  onMouseEnter={(e) =>
                    item.children && handleSubOpen(e, item.children)
                  }
                  onClick={() => {
                    if (!disableClick && !item.link) {
                      item.onClick?.();
                      handleClose();
                    }
                  }}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#1976d2" },
                  }}
                >
                  <Typography variant="body2">{`${index + 1}. ${item.label}`}</Typography>
                  {item.children && <ArrowDropDownIcon fontSize="small" />}
                </Box>
              );

              return item.link && !disableClick ? (
                <LoadingLink href={item.link} key={item.label}>
                  {Content}
                </LoadingLink>
              ) : (
                Content
              );
            })}
          </Paper>
        </ClickAwayListener>
      </Popper>

      {submenuItems && (
        <Popper
          open={subOpen}
          anchorEl={subAnchorEl}
          placement="right-start"
          disablePortal
          style={{ zIndex: 1301 }}
        >
          <Paper
            sx={{
              backgroundColor: "#0d47a1",
              color: "white",
              p: 0,
              minWidth: 200,
              borderRadius: 0,
            }}
          >
            {submenuItems.map((child, i) => {
              const Content = (
                <Box
                  key={child.label}
                  onClick={() => {
                    if (!disableClick && !child.link) {
                      child.onClick?.();
                      handleClose();
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#2196f3" },
                  }}
                >
                  <Typography variant="body2">{`${i + 1}. ${child.label}`}</Typography>
                </Box>
              );

              return child.link && !disableClick ? (
                <LoadingLink href={child.link} key={child.label}>
                  {Content}
                </LoadingLink>
              ) : (
                Content
              );
            })}
          </Paper>
        </Popper>
      )}
    </Box>
  );
};

export default NavItem;
