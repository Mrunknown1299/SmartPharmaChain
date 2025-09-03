import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Store, Update, Search, ShoppingCart } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const RetailerDashboard = () => {
  const { account, contract, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [drugDetails, setDrugDetails] = useState(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [consumerAddress, setConsumerAddress] = useState('');

  const searchDrug = async () => {
    if (!contract) {
      toast.error('Smart contract not initialized');
      return;
    }

    if (!batchId.trim()) {
      toast.error('Please enter a batch ID');
      return;
    }

    setSearchLoading(true);
    try {
      const drugData = await contract.getDrugDetails(batchId);
      const [name, manufacturer, manufactureDate, expiryDate, status, manufacturerId, distributorId, retailerId, consumerId] = drugData;
      
      const statusNames = ['Manufactured', 'Distributed', 'Retailed', 'Sold'];
      
      setDrugDetails({
        batchId,
        name,
        manufacturer,
        manufactureDate: new Date(manufactureDate.toNumber() * 1000).toLocaleDateString(),
        expiryDate: new Date(expiryDate.toNumber() * 1000).toLocaleDateString(),
        status: statusNames[status] || 'Unknown',
        statusCode: status,
        manufacturerId,
        distributorId: distributorId !== '0x0000000000000000000000000000000000000000' ? distributorId : null,
        retailerId: retailerId !== '0x0000000000000000000000000000000000000000' ? retailerId : null,
        consumerId: consumerId !== '0x0000000000000000000000000000000000000000' ? consumerId : null,
      });

      toast.success('Drug details retrieved successfully');
    } catch (error) {
      console.error('Error searching drug:', error);
      if (error.message.includes('Drug does not exist')) {
        toast.error('Drug not found with this batch ID');
      } else {
        toast.error('Failed to search drug: ' + error.message);
      }
      setDrugDetails(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const retailDrug = async () => {
    if (!contract) {
      toast.error('Smart contract not initialized');
      return;
    }

    if (!drugDetails) {
      toast.error('Please search for a drug first');
      return;
    }

    if (drugDetails.statusCode !== 1) {
      toast.error('Drug must be in "Distributed" state to retail');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.retailDrug(drugDetails.batchId);
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Drug retailed successfully!');
      
      // Refresh drug details
      await searchDrug();
    } catch (error) {
      console.error('Error retailing drug:', error);
      toast.error('Failed to retail drug: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sellDrug = async () => {
    if (!contract) {
      toast.error('Smart contract not initialized');
      return;
    }

    if (!drugDetails) {
      toast.error('Please search for a drug first');
      return;
    }

    if (drugDetails.statusCode !== 2) {
      toast.error('Drug must be in "Retailed" state to sell');
      return;
    }

    if (!consumerAddress.trim()) {
      toast.error('Please enter consumer address');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.sellDrug(drugDetails.batchId, consumerAddress);
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Drug sold successfully!');
      
      // Refresh drug details and close dialog
      await searchDrug();
      setSellDialogOpen(false);
      setConsumerAddress('');
    } catch (error) {
      console.error('Error selling drug:', error);
      toast.error('Failed to sell drug: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Manufactured': return 'primary';
      case 'Distributed': return 'info';
      case 'Retailed': return 'warning';
      case 'Sold': return 'success';
      default: return 'default';
    }
  };

  const canRetail = drugDetails && drugDetails.statusCode === 1;
  const canSell = drugDetails && drugDetails.statusCode === 2;

  if (!account) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please connect your wallet to access the Retailer Dashboard.
        </Alert>
      </Container>
    );
  }

  if (!isCorrectNetwork()) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          Please switch to the Sepolia testnet to use this application.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.15) 0%, rgba(255, 192, 203, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 182, 193, 0.3)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(255, 182, 193, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Store sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                mb: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              🏪 Retailer Dashboard
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.5, color: '#2C3E50', fontWeight: 500 }}>
              Retail pharmaceutical products to end consumers and manage inventory
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Drug Search */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
                Search Drug
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Batch ID"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Enter batch ID to search"
                  sx={{ mb: 2 }}
                  onKeyPress={(e) => e.key === 'Enter' && searchDrug()}
                />
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={searchDrug}
                  disabled={searchLoading}
                  startIcon={searchLoading ? <CircularProgress size={20} /> : <Search />}
                >
                  {searchLoading ? 'Searching...' : 'Search Drug'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Retail Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Update sx={{ mr: 1, verticalAlign: 'middle' }} />
                Retail Actions
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {drugDetails ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Alert 
                        severity={canRetail ? 'info' : canSell ? 'success' : 'warning'} 
                        sx={{ mb: 2 }}
                      >
                        {canRetail && 'Drug is ready for retailing'}
                        {canSell && 'Drug is ready for sale to consumers'}
                        {!canRetail && !canSell && `Drug is in "${drugDetails.status}" state`}
                      </Alert>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={retailDrug}
                        disabled={loading || !canRetail}
                        startIcon={loading ? <CircularProgress size={20} /> : <Store />}
                        sx={{ mb: 1 }}
                      >
                        {loading ? 'Processing...' : 'Mark as Retailed'}
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => setSellDialogOpen(true)}
                        disabled={loading || !canSell}
                        startIcon={<ShoppingCart />}
                      >
                        Sell to Consumer
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Search for a drug first to enable retail actions
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Drug Details */}
        {drugDetails && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Drug Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Batch ID
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {drugDetails.batchId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Drug Name
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {drugDetails.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Manufacturer
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {drugDetails.manufacturer}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={drugDetails.status}
                      color={getStatusColor(drugDetails.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Manufacture Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {drugDetails.manufactureDate}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {drugDetails.expiryDate}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      🏪 Retailer Address
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 182, 193, 0.1)',
                        padding: '6px 10px',
                        borderRadius: 1,
                        color: '#2C3E50',
                        wordBreak: 'break-all',
                        border: '1px solid rgba(255, 182, 193, 0.2)',
                      }}
                    >
                      {drugDetails.retailerId || 'Not retailed yet'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      👤 Consumer Address
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        background: 'rgba(152, 251, 152, 0.1)',
                        padding: '6px 10px',
                        borderRadius: 1,
                        color: '#2C3E50',
                        wordBreak: 'break-all',
                        border: '1px solid rgba(152, 251, 152, 0.2)',
                      }}
                    >
                      {drugDetails.consumerId || 'Not sold yet'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Supply Chain Progress
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Manufactured" 
                      color="primary" 
                      size="small"
                      variant={drugDetails.statusCode >= 0 ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Distributed" 
                      color="info" 
                      size="small"
                      variant={drugDetails.statusCode >= 1 ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Retailed" 
                      color="warning" 
                      size="small"
                      variant={drugDetails.statusCode >= 2 ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Sold" 
                      color="success" 
                      size="small"
                      variant={drugDetails.statusCode >= 3 ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onClose={() => setSellDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sell Drug to Consumer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the consumer's wallet address to complete the sale.
          </Typography>
          <TextField
            fullWidth
            label="Consumer Wallet Address"
            value={consumerAddress}
            onChange={(e) => setConsumerAddress(e.target.value)}
            placeholder="0x..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={sellDrug} 
            variant="contained" 
            disabled={loading || !consumerAddress.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Complete Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RetailerDashboard;
