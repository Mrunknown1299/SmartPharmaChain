import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Share,
  Print,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const DrugVerification = () => {
  const { batchId } = useParams();
  const { contract } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (batchId) {
      verifyDrug();
    }
  }, [batchId, contract]);

  const verifyDrug = async () => {
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

            const [
              name,
              manufacturer,
              manufactureDate,
              expiryDate,
              status,
              manufacturerId,
              distributorId,
              retailerId,
              consumerId,
              isTemperatureCompliant,
              minTemp,
              maxTemp
            ] = drugDetails;

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
              isTemperatureCompliant,
              minTemp: minTemp ? minTemp.toNumber() : 2,
              maxTemp: maxTemp ? maxTemp.toNumber() : 8,
              manufacturerId,
              distributorId: distributorId !== '0x0000000000000000000000000000000000000000' ? distributorId : null,
              retailerId: retailerId !== '0x0000000000000000000000000000000000000000' ? retailerId : null,
              consumerId: consumerId !== '0x0000000000000000000000000000000000000000' ? consumerId : null,
              source: 'blockchain',
              verificationTime: new Date().toISOString()
            };
          } else {
            result = {
              isAuthentic: false,
              batchId,
              source: 'blockchain',
              verificationTime: new Date().toISOString()
            };
          }
        } catch (blockchainError) {
          console.error('Blockchain verification failed:', blockchainError);
          throw new Error('Blockchain verification failed');
        }
      } else {
        throw new Error('Contract not available');
      }

      setVerificationResult(result);

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
        } else {
          throw new Error(data.error);
        }
      } catch (apiError) {
        console.error('API verification failed:', apiError);
        setVerificationResult({
          isAuthentic: false,
          batchId,
          error: 'Verification failed',
          source: 'error',
          verificationTime: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const shareVerification = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Drug Verification Result',
          text: `Drug ${batchId} verification: ${verificationResult.isAuthentic ? 'Authentic' : 'Not Verified'}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Verification link copied to clipboard');
    }
  };

  const printVerification = () => {
    window.print();
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

    if (result.error) {
      return <Error color="error" sx={{ fontSize: 60 }} />;
    }

    if (result.isAuthentic) {
      if (result.isExpired) {
        return <Warning color="warning" sx={{ fontSize: 60 }} />;
      } else {
        return <CheckCircle color="success" sx={{ fontSize: 60 }} />;
      }
    } else {
      return <Error color="error" sx={{ fontSize: 60 }} />;
    }
  };

  const getVerificationMessage = (result) => {
    if (!result) return '';

    if (result.error) {
      return 'Verification Failed';
    }

    if (result.isAuthentic) {
      if (result.isExpired) {
        return 'Authentic but Expired';
      } else {
        return 'Verified Authentic';
      }
    } else {
      return 'Not Verified';
    }
  };

  const getVerificationSeverity = (result) => {
    if (!result) return 'info';

    if (result.error) {
      return 'error';
    }

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

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Verifying drug authenticity...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Drug Verification Result
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Batch ID: {batchId}
        </Typography>
      </Paper>

      {verificationResult && (
        <Grid container spacing={3}>
          {/* Verification Status */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {getVerificationIcon(verificationResult)}
                  <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                    {getVerificationMessage(verificationResult)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Verified on {new Date(verificationResult.verificationTime).toLocaleString()}
                  </Typography>
                </Box>

                <Alert severity={getVerificationSeverity(verificationResult)} sx={{ mb: 3 }}>
                  {verificationResult.error ? (
                    'Unable to verify this drug. Please check the batch ID or try again later.'
                  ) : verificationResult.isAuthentic ? (
                    verificationResult.isExpired ? (
                      'This drug is authentic but has expired. Do not use expired medications and consult your healthcare provider.'
                    ) : !verificationResult.isTemperatureCompliant ? (
                      'WARNING: This drug may be unsafe! Temperature violations were detected during its supply chain journey.'
                    ) : (
                      'This drug has been verified as authentic and is safe to use according to the blockchain record.'
                    )
                  ) : (
                    'This drug could not be verified as authentic. It may be counterfeit. Do not use this medication and report it to authorities immediately.'
                  )}
                </Alert>

                {verificationResult.isAuthentic && !verificationResult.isTemperatureCompliant && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Temperature Violation Detected
                    </Typography>
                    <Typography variant="body2">
                      The temperature monitor recorded conditions outside the safe range ({verificationResult.minTemp}°C - {verificationResult.maxTemp}°C). The drug's efficacy may be compromised.
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={shareVerification}
                  >
                    Share Result
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={printVerification}
                  >
                    Print Result
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Drug Details */}
          {verificationResult.isAuthentic && !verificationResult.error && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Drug Information
                  </Typography>

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
                        Current Status
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
                          color: verificationResult.isExpired ? 'error.main' : 'text.primary',
                          fontWeight: verificationResult.isExpired ? 'bold' : 'normal'
                        }}
                      >
                        {verificationResult.expiryDate}
                        {verificationResult.isExpired && ' (EXPIRED)'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Supply Chain History
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ✓ <strong>Manufactured</strong> by {verificationResult.manufacturer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'block', mb: 2 }}>
                      Address: {verificationResult.manufacturerId}
                    </Typography>

                    {verificationResult.distributorId && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          ✓ <strong>Distributed</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'block', mb: 2 }}>
                          Address: {verificationResult.distributorId}
                        </Typography>
                      </>
                    )}

                    {verificationResult.retailerId && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          ✓ <strong>Retailed</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'block', mb: 2 }}>
                          Address: {verificationResult.retailerId}
                        </Typography>
                      </>
                    )}

                    {verificationResult.consumerId && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          ✓ <strong>Sold</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'block', mb: 2 }}>
                          Consumer: {verificationResult.consumerId}
                        </Typography>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Verification Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
                  SmartPharmaChain Verification System
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Info color="primary" />
                  <Typography variant="body2">
                    Verified via: {verificationResult.source === 'blockchain' ? 'Ethereum Blockchain' : 'API Fallback'}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  This verification was performed on {new Date(verificationResult.verificationTime).toLocaleString()}
                  using SmartPharmaChain's blockchain-based pharmaceutical tracking system.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DrugVerification;
