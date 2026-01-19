import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Home,
  AdminPanelSettings,
  Factory,
  LocalShipping,
  Store,
  VerifiedUser,
  MoreVert,
  Logout,
  Person,
  ContentCopy,
  CheckCircle,
  AccountBalance,
  Analytics,
  DeviceThermostat,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet, formatAddress, isCorrectNetwork, chainId } = useWeb3();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [walletMenuAnchor, setWalletMenuAnchor] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWalletMenuOpen = (event) => {
    setWalletMenuAnchor(event.currentTarget);
  };

  const handleWalletMenuClose = () => {
    setWalletMenuAnchor(null);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard!');
      handleWalletMenuClose();
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleWalletMenuClose();
  };

  const getNetworkName = () => {
    switch (chainId) {
      case 11155111: return 'Sepolia';
      case 1337: return 'Localhost';
      case 1: return 'Mainnet';
      case 5: return 'Goerli';
      default: return `Network ${chainId}`;
    }
  };

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> },
    { label: 'Manufacturer', path: '/manufacturer', icon: <Factory /> },
    { label: 'Distributor', path: '/distributor', icon: <LocalShipping /> },
    { label: 'Retailer', path: '/retailer', icon: <Store /> },
    { label: 'Consumer', path: '/consumer', icon: <VerifiedUser /> },
    { label: 'IoT Monitor', path: '/monitoring', icon: <DeviceThermostat /> },
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          SmartPharmaChain
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 2 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                borderRadius: '20px', // Oval shape
                bgcolor: 'rgba(255, 255, 255, 0.15)', // Light background
                px: 3, // Horizontal padding for oval width
                py: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <Typography variant="inherit">{item.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {account ? (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Chip
              label={formatAddress(account)}
              color="secondary"
              onDelete={handleWalletMenuOpen}
              deleteIcon={<MoreVert />}
            />
            <Menu
              anchorEl={walletMenuAnchor}
              open={Boolean(walletMenuAnchor)}
              onClose={handleWalletMenuClose}
            >
              <MenuItem onClick={copyAddress}>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy Address</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDisconnect}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                <ListItemText>Disconnect</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={connectWallet} startIcon={<AccountBalanceWallet />}>
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
