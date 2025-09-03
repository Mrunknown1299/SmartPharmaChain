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
} from '@mui/material';
import { LocalShipping, Update, Search } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const DistributorDashboard = () => {
  const { account, contract, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [drugDetails, setDrugDetails] = useState(null);

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

  const distributeDrug = async () => {
    if (!contract) {
      toast.error('Smart contract not initialized');
      return;
    }

    if (!drugDetails) {
      toast.error('Please search for a drug first');
      return;
    }

    if (drugDetails.statusCode !== 0) {
      toast.error('Drug must be in "Manufactured" state to distribute');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.distributeDrug(drugDetails.batchId);
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Drug distributed successfully!');
      
      // Refresh drug details
      await searchDrug();
    } catch (error) {
      console.error('Error distributing drug:', error);
      toast.error('Failed to distribute drug: ' + error.message);
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

  const canDistribute = drugDetails && drugDetails.statusCode === 0;

  if (!account) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please connect your wallet to access the Distributor Dashboard.
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
          p: 2.5,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255, 218, 185, 0.2) 0%, rgba(255, 228, 181, 0.2) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 218, 185, 0.4)',
          boxShadow: '0 8px 32px rgba(255, 218, 185, 0.3)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFDAB9 0%, #FFE4B5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <LocalShipping sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#8B4513', // Saddle Brown for better contrast
                fontWeight: 700,
                fontSize: '1rem',
                mb: 0.5,
              }}
            >
              Distributor Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
              Receive and distribute pharmaceutical products in the supply chain
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

        {/* Distribution Action */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Update sx={{ mr: 1, verticalAlign: 'middle' }} />
                Distribute Drug
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {drugDetails ? (
                  <>
                    <Alert 
                      severity={canDistribute ? 'info' : 'warning'} 
                      sx={{ mb: 2 }}
                    >
                      {canDistribute 
                        ? 'Drug is ready for distribution'
                        : `Drug is in "${drugDetails.status}" state and cannot be distributed`
                      }
                    </Alert>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={distributeDrug}
                      disabled={loading || !canDistribute}
                      startIcon={loading ? <CircularProgress size={20} /> : <LocalShipping />}
                    >
                      {loading ? 'Distributing...' : 'Mark as Distributed'}
                    </Button>
                  </>
                ) : (
                  <Alert severity="info">
                    Search for a drug first to enable distribution
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
                      👨‍🔬 Manufacturer Address
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        background: 'rgba(135, 206, 235, 0.1)',
                        padding: '6px 10px',
                        borderRadius: 1,
                        color: '#2C3E50',
                        wordBreak: 'break-all',
                        border: '1px solid rgba(135, 206, 235, 0.2)',
                      }}
                    >
                      {drugDetails.manufacturerId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      🚚 Distributor Address
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 218, 185, 0.1)',
                        padding: '6px 10px',
                        borderRadius: 1,
                        color: '#2C3E50',
                        wordBreak: 'break-all',
                        border: '1px solid rgba(255, 218, 185, 0.2)',
                      }}
                    >
                      {drugDetails.distributorId || 'Not distributed yet'}
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
    </Container>
  );
};

export default DistributorDashboard;
