import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AdminPanelSettings,
  PersonAdd,
  Factory,
  LocalShipping,
  Store,
  CheckCircle,
  ContentCopy,
  Refresh,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const AdminDashboard = () => {
  const { account, contract, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [registeredStakeholders, setRegisteredStakeholders] = useState({
    manufacturers: [],
    distributors: [],
    retailers: [],
  });

  const [newStakeholder, setNewStakeholder] = useState({
    address: '',
    type: 'manufacturer',
    companyName: '',
  });

  // Check if current user is contract owner
  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState('');

  useEffect(() => {
    checkOwnership();
  }, [account, contract]);

  const checkOwnership = async () => {
    if (!contract || !account) return;

    try {
      const owner = await contract.owner();
      setContractOwner(owner);
      setIsOwner(account.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error('Error checking ownership:', error);
    }
  };

  const registerStakeholder = async () => {
    if (!contract || !newStakeholder.address.trim()) {
      toast.error('Please enter a valid address');
      return;
    }

    if (!isCorrectNetwork()) {
      toast.error('Please switch to Sepolia network');
      return;
    }

    setLoading(true);
    try {
      let tx;
      const address = newStakeholder.address.trim();

      switch (newStakeholder.type) {
        case 'manufacturer':
          tx = await contract.registerManufacturer(address);
          break;
        case 'distributor':
          tx = await contract.registerDistributor(address);
          break;
        case 'retailer':
          tx = await contract.registerRetailer(address);
          break;
        default:
          throw new Error('Invalid stakeholder type');
      }

      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success(`${newStakeholder.type} registered successfully!`);
      setNewStakeholder({ address: '', type: 'manufacturer' });

      // Refresh the list
      // Note: In a real app, you'd query events or maintain a list

    } catch (error) {
      console.error('Error registering stakeholder:', error);
      toast.error('Failed to register stakeholder: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!account) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please connect your wallet to access the Admin Dashboard.
        </Alert>
      </Container>
    );
  }

  if (!isCorrectNetwork()) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Please switch to Sepolia network to access the Admin Dashboard.
        </Alert>
      </Container>
    );
  }

  if (!isOwner) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            Only the contract owner can access this dashboard.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Contract Owner: {formatAddress(contractOwner)}
          </Typography>
          <Typography variant="body2">
            Your Address: {formatAddress(account)}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings fontSize="large" />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage stakeholder registrations and system settings
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Register New Stakeholder */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAdd sx={{ fontSize: 20 }} />
                Register New Stakeholder
              </Typography>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={newStakeholder.companyName}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, companyName: e.target.value })}
                  placeholder="e.g., PharmaCorp Ltd"
                  sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1rem' }, '& .MuiInputLabel-root': { fontSize: '1rem' } }}
                />

                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={newStakeholder.address}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, address: e.target.value })}
                  placeholder="0x..."
                  sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1rem' }, '& .MuiInputLabel-root': { fontSize: '1rem' } }}
                />

                <TextField
                  fullWidth
                  select
                  label="Stakeholder Type"
                  value={newStakeholder.type}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, type: e.target.value })}
                  SelectProps={{ native: true }}
                  sx={{ mb: 3, '& .MuiInputBase-input': { fontSize: '1rem' }, '& .MuiInputLabel-root': { fontSize: '1rem' } }}
                >
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                </TextField>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={registerStakeholder}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <PersonAdd />}
                  sx={{
                    background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8e24aa 0%, #d81b60 100%)',
                    },
                  }}
                >
                  {loading ? 'Registering...' : 'Register Stakeholder'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                Quick Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Factory />}
                  onClick={() => setNewStakeholder({ ...newStakeholder, type: 'manufacturer' })}
                  size="small"
                >
                  Register Manufacturer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalShipping />}
                  onClick={() => setNewStakeholder({ ...newStakeholder, type: 'distributor' })}
                  size="small"
                >
                  Register Distributor
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Store />}
                  onClick={() => setNewStakeholder({ ...newStakeholder, type: 'retailer' })}
                  size="small"
                >
                  Register Retailer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                System Information
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Contract Owner
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          background: 'rgba(135, 206, 235, 0.1)',
                          padding: '4px 8px',
                          borderRadius: 1,
                          color: '#2C3E50',
                          fontWeight: 500,
                          minWidth: 0,
                          wordBreak: 'break-all',
                        }}
                      >
                        {formatAddress(contractOwner)}
                      </Typography>
                      <Tooltip title="Copy Full Address">
                        <IconButton
                          size="small"
                          onClick={() => copyAddress(contractOwner)}
                          sx={{
                            background: 'rgba(135, 206, 235, 0.1)',
                            '&:hover': { background: 'rgba(135, 206, 235, 0.2)' }
                          }}
                        >
                          <ContentCopy sx={{ fontSize: 16, color: '#2C3E50' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Your Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          background: 'rgba(255, 182, 193, 0.1)',
                          padding: '4px 8px',
                          borderRadius: 1,
                          color: '#2C3E50',
                          fontWeight: 500,
                          minWidth: 0,
                          wordBreak: 'break-all',
                        }}
                      >
                        {formatAddress(account)}
                      </Typography>
                      <Chip
                        label="👑 Owner"
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 100%)',
                          color: '#2C3E50',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
