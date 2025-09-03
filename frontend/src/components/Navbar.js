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
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
  ];

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
          onClick={() => navigate('/')}
        >
          🏥 SmartMediChain
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.icon}
                  {item.label}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Network Status */}
        {account && (
          <Chip
            label={getNetworkName()}
            color={isCorrectNetwork() ? 'success' : 'error'}
            size="small"
            sx={{ mr: 1 }}
          />
        )}

        {/* Wallet Connection */}
        {account ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Wallet Options">
              <Button
                onClick={handleWalletMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 100%)',
                  color: '#2C3E50',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(135, 206, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B0E0E6 0%, #FFC0CB 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(135, 206, 235, 0.4)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 100%)',
                    fontSize: '14px',
                  }}
                >
                  <CheckCircle fontSize="small" sx={{ color: '#2C3E50' }} />
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#2C3E50', opacity: 0.8 }}>
                    Connected
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.85rem' }}>
                    {formatAddress(account)}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>

            <Menu
              anchorEl={walletMenuAnchor}
              open={Boolean(walletMenuAnchor)}
              onClose={handleWalletMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuItem onClick={copyAddress}>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Copy Address" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDisconnect} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText primary="Disconnect Wallet" />
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<AccountBalance />}
            onClick={connectWallet}
            sx={{
              textTransform: 'none',
              borderRadius: 25,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 50%, #FFDAB9 100%)',
              color: '#2C3E50',
              boxShadow: '0 6px 20px rgba(135, 206, 235, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #B0E0E6 0%, #FFC0CB 50%, #FFE4B5 100%)',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(135, 206, 235, 0.5)',
              },
            }}
          >
            🔗 Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
