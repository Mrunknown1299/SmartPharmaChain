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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  VerifiedUser,
  Search,
  CheckCircle,
  Error,
  Warning,
  Info,
  QrCodeScanner,
  Close,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const ConsumerVerification = () => {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });

  // Company name mapping - fetch from backend
  const [companyNames, setCompanyNames] = useState({});

  const getCompanyName = (address, type) => {
    if (!address) return `Not ${type} yet`;

    // Check if we already have this company cached
    const cacheKey = `${address}_${type}`;
    if (companyNames[cacheKey]) {
      return companyNames[cacheKey];
    }

    // Fetch from backend asynchronously
    fetchCompanyName(address, type);

    // Return address format while loading
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchCompanyName = async (address, type) => {
    const cacheKey = `${address}_${type}`;

    try {
      const response = await fetch(`http://localhost:5000/api/companies/${address}?type=${type}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCompanyNames(prev => ({
          ...prev,
          [cacheKey]: data.data.name
        }));
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
      // Set fallback name
      setCompanyNames(prev => ({
        ...prev,
        [cacheKey]: `${type.charAt(0).toUpperCase() + type.slice(1)} ${address.slice(0, 6)}...${address.slice(-4)}`
      }));
    }
  };

  const verifyDrug = async () => {
    if (!batchId.trim()) {
      toast.error('Please enter a batch ID');
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      let result = {};

      if (contract) {
        // Try blockchain verification first
        try {
          const isAuthentic = await contract.verifyDrug(batchId);

          if (isAuthentic) {
            const drugDetails = await contract.getDrugDetails(batchId);
            const isExpired = await contract.isDrugExpired(batchId);

            const [name, manufacturer, manufactureDate, expiryDate, status, manufacturerId, distributorId, retailerId, consumerId] = drugDetails;

            const statusNames = ['Manufactured', 'Distributed', 'Retailed', 'Sold'];

            result = {
              isAuthentic: true,
              batchId,
              name,
              manufacturer,
              manufactureDate: new Date(manufactureDate.toNumber() * 1000).toISOString().split('T')[0],
              expiryDate: new Date(expiryDate.toNumber() * 1000).toISOString().split('T')[0],
              status: statusNames[status] || 'Unknown',
              isExpired,
              manufacturerId,
              distributorId: distributorId !== '0x0000000000000000000000000000000000000000' ? distributorId : null,
              retailerId: retailerId !== '0x0000000000000000000000000000000000000000' ? retailerId : null,
              consumerId: consumerId !== '0x0000000000000000000000000000000000000000' ? consumerId : null,
              source: 'blockchain'
            };
          } else {
            result = {
              isAuthentic: false,
              batchId,
              source: 'blockchain'
            };
          }
        } catch (blockchainError) {
          console.error('Blockchain verification failed:', blockchainError);
          // Fall back to API verification
          throw new Error('Blockchain verification failed');
        }
      } else {
        // Fall back to API verification
        throw new Error('Contract not available');
      }

      setVerificationResult(result);

      if (result.isAuthentic) {
        if (result.isExpired) {
          toast.warning('Drug is authentic but expired!');
        } else {
          toast.success('Drug verified as authentic!');
        }
      } else {
        toast.error('Drug verification failed - potentially counterfeit!');
      }

    } catch (error) {
      console.error('Verification error:', error);

      // Try API fallback
      try {
        const response = await fetch(`/api/blockchain/verify/${batchId}`, {
          method: 'POST',
        });
        const data = await response.json();

        if (data.success) {
          setVerificationResult({
            ...data.data,
            source: 'api'
          });

          if (data.data.isAuthentic) {
            toast.success('Drug verified as authentic (via API)!');
          } else {
            toast.error('Drug verification failed!');
          }
        } else {
          throw new Error(data.error);
        }
      } catch (apiError) {
        console.error('API verification failed:', apiError);
        toast.error('Verification failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verifyDrug();
    }
  };

  const handleDetailClick = (type, id) => {
    if (!id) return;

    const details = {
      manufacturer: {
        title: 'Manufacturer Details',
        content: `Company: ${getCompanyName(id, 'manufacturer')}\nAddress: ${id}\nRole: Manufacturer\nStatus: Verified`
      },
      distributor: {
        title: 'Distributor Details',
        content: `Company: ${getCompanyName(id, 'distributor')}\nAddress: ${id}\nRole: Distributor\nStatus: Verified`
      },
      retailer: {
        title: 'Retailer Details',
        content: `Company: ${getCompanyName(id, 'retailer')}\nAddress: ${id}\nRole: Retailer\nStatus: Verified`
      }
    };

    setDetailDialog({
      open: true,
      data: details[type]
    });
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

  const getVerificationIcon = (result) => {
    if (!result) return null;
    
    if (result.isAuthentic) {
      if (result.isExpired) {
        return <Warning color="warning" sx={{ fontSize: 40 }} />;
      } else {
        return <CheckCircle color="success" sx={{ fontSize: 40 }} />;
      }
    } else {
      return <Error color="error" sx={{ fontSize: 40 }} />;
    }
  };

  const getVerificationMessage = (result) => {
    if (!result) return '';
    
    if (result.isAuthentic) {
      if (result.isExpired) {
        return 'Drug is authentic but has expired';
      } else {
        return 'Drug is authentic and valid';
      }
    } else {
      return 'Drug verification failed - potentially counterfeit';
    }
  };

  const getVerificationSeverity = (result) => {
    if (!result) return 'info';
    
    if (result.isAuthentic) {
      if (result.isExpired) {
        return 'warning';
      } else {
        return 'success';
      }
    } else {
      return 'error';
    }
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(76, 175, 80, 0.15)',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <VerifiedUser sx={{ fontSize: 24, color: 'white' }} />
        </Box>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            fontSize: '1rem',
          }}
        >
          Consumer Verification
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', fontSize: '0.75rem', lineHeight: 1.4 }}>
          Verify pharmaceutical product authenticity by scanning QR codes or entering batch IDs
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Verification Input */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                Drug Verification
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Batch ID"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter batch ID (e.g., BATCH-2024-001)"
                  sx={{ mb: 2 }}
                />
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={verifyDrug}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                >
                  {loading ? 'Verifying...' : 'Verify Drug'}
                </Button>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Scan the QR code on the drug package or manually enter the batch ID to verify authenticity.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Verification Results */}
        {verificationResult && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verification Results
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {getVerificationIcon(verificationResult)}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {getVerificationMessage(verificationResult)}
                  </Typography>
                </Box>

                <Alert severity={getVerificationSeverity(verificationResult)} sx={{ mb: 3 }}>
                  {verificationResult.isAuthentic ? (
                    verificationResult.isExpired ? (
                      'This drug is authentic but has expired. Do not use expired medications.'
                    ) : (
                      'This drug has been verified as authentic and is safe to use.'
                    )
                  ) : (
                    'This drug could not be verified. It may be counterfeit. Do not use this medication and report it to authorities.'
                  )}
                </Alert>

                {verificationResult.isAuthentic && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Batch ID
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.batchId}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Drug Name
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Manufacturer
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.manufacturer}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={verificationResult.status}
                          color={getStatusColor(verificationResult.status)}
                          size="small"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Manufacture Date
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.manufactureDate}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Expiry Date
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2,
                            color: verificationResult.isExpired ? 'error.main' : 'text.primary'
                          }}
                        >
                          {verificationResult.expiryDate}
                          {verificationResult.isExpired && ' (EXPIRED)'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔗 Supply Chain Journey
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(135, 206, 235, 0.05) 100%)',
                          borderRadius: 2,
                          border: '1px solid rgba(135, 206, 235, 0.2)',
                          textAlign: 'center',
                        }}>
                          <Typography variant="h6" sx={{ fontSize: '2rem', mb: 1 }}>🏭</Typography>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Manufactured
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#2C3E50',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => handleDetailClick('manufacturer', verificationResult.manufacturerId)}
                          >
                            {getCompanyName(verificationResult.manufacturerId, 'manufacturer')}
                          </Typography>
                          <Typography variant="caption" sx={{
                            display: 'block',
                            mt: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                          }}>
                            ID: {verificationResult.manufacturerId?.slice(0, 6)}...{verificationResult.manufacturerId?.slice(-4)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          p: 2,
                          background: verificationResult.distributorId
                            ? 'linear-gradient(135deg, rgba(255, 218, 185, 0.1) 0%, rgba(255, 218, 185, 0.05) 100%)'
                            : 'rgba(0,0,0,0.05)',
                          borderRadius: 2,
                          border: verificationResult.distributorId
                            ? '1px solid rgba(255, 218, 185, 0.2)'
                            : '1px dashed rgba(0,0,0,0.2)',
                          textAlign: 'center',
                          opacity: verificationResult.distributorId ? 1 : 0.6,
                        }}>
                          <Typography variant="h6" sx={{ fontSize: '2rem', mb: 1 }}>
                            {verificationResult.distributorId ? '🚚' : '⏳'}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Distributed
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#2C3E50',
                              cursor: verificationResult.distributorId ? 'pointer' : 'default',
                              '&:hover': verificationResult.distributorId ? { textDecoration: 'underline' } : {}
                            }}
                            onClick={() => verificationResult.distributorId && handleDetailClick('distributor', verificationResult.distributorId)}
                          >
                            {getCompanyName(verificationResult.distributorId, 'distributor')}
                          </Typography>
                          {verificationResult.distributorId && (
                            <Typography variant="caption" sx={{
                              display: 'block',
                              mt: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                            }}>
                              ID: {verificationResult.distributorId?.slice(0, 6)}...{verificationResult.distributorId?.slice(-4)}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          p: 2,
                          background: verificationResult.retailerId
                            ? 'linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 182, 193, 0.05) 100%)'
                            : 'rgba(0,0,0,0.05)',
                          borderRadius: 2,
                          border: verificationResult.retailerId
                            ? '1px solid rgba(255, 182, 193, 0.2)'
                            : '1px dashed rgba(0,0,0,0.2)',
                          textAlign: 'center',
                          opacity: verificationResult.retailerId ? 1 : 0.6,
                        }}>
                          <Typography variant="h6" sx={{ fontSize: '2rem', mb: 1 }}>
                            {verificationResult.retailerId ? '🏪' : '⏳'}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Sold By
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#2C3E50',
                              cursor: verificationResult.retailerId ? 'pointer' : 'default',
                              '&:hover': verificationResult.retailerId ? { textDecoration: 'underline' } : {}
                            }}
                            onClick={() => verificationResult.retailerId && handleDetailClick('retailer', verificationResult.retailerId)}
                          >
                            {getCompanyName(verificationResult.retailerId, 'retailer')}
                          </Typography>
                          {verificationResult.retailerId && (
                            <Typography variant="caption" sx={{
                              display: 'block',
                              mt: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                            }}>
                              ID: {verificationResult.retailerId?.slice(0, 6)}...{verificationResult.retailerId?.slice(-4)}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          p: 2,
                          background: verificationResult.consumerId
                            ? 'linear-gradient(135deg, rgba(152, 251, 152, 0.1) 0%, rgba(152, 251, 152, 0.05) 100%)'
                            : 'rgba(0,0,0,0.05)',
                          borderRadius: 2,
                          border: verificationResult.consumerId
                            ? '1px solid rgba(152, 251, 152, 0.2)'
                            : '1px dashed rgba(0,0,0,0.2)',
                          textAlign: 'center',
                          opacity: verificationResult.consumerId ? 1 : 0.6,
                        }}>
                          <Typography variant="h6" sx={{ fontSize: '2rem', mb: 1 }}>
                            {verificationResult.consumerId ? '👤' : '🛒'}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Purchased
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                            {verificationResult.consumerId ? 'Verified Customer' : 'Available'}
                          </Typography>
                          {verificationResult.consumerId && (
                            <Typography variant="caption" sx={{
                              display: 'block',
                              mt: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                            }}>
                              ID: {verificationResult.consumerId?.slice(0, 6)}...{verificationResult.consumerId?.slice(-4)}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                )}

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Verified via: {verificationResult.source === 'blockchain' ? 'Blockchain' : 'API'} • 
                    Verification time: {new Date().toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}


      </Grid>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          {detailDialog.data?.title}
          <Button
            onClick={() => setDetailDialog({ open: false, data: null })}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            whiteSpace: 'pre-line',
            fontFamily: 'monospace',
            backgroundColor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}>
            {detailDialog.data?.content}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailDialog({ open: false, data: null })}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConsumerVerification;
