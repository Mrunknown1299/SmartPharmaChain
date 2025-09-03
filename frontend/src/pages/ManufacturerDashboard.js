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
  Divider,
} from '@mui/material';
import { Factory, Add, QrCode } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';
import QRCode from 'qrcode.react';

const ManufacturerDashboard = () => {
  const { account, contract, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  
  const [drugForm, setDrugForm] = useState({
    batchId: '',
    name: '',
    manufacturer: '',
    expiryDate: '',
    description: '',
    dosage: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDrugForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateBatchId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const batchId = `BATCH-${timestamp}-${random}`;
    setDrugForm(prev => ({
      ...prev,
      batchId
    }));
  };

  const manufactureDrug = async () => {
    if (!contract) {
      toast.error('Smart contract not initialized');
      return;
    }

    if (!drugForm.batchId || !drugForm.name || !drugForm.manufacturer || !drugForm.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const expiryTimestamp = Math.floor(new Date(drugForm.expiryDate).getTime() / 1000);
      
      const tx = await contract.manufactureDrug(
        drugForm.batchId,
        drugForm.name,
        drugForm.manufacturer,
        expiryTimestamp
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      toast.success('Drug manufactured successfully!');
      
      // Generate QR code
      await generateQRCode();
      
      // Reset form
      setDrugForm({
        batchId: '',
        name: '',
        manufacturer: '',
        expiryDate: '',
        description: '',
        dosage: '',
      });

    } catch (error) {
      console.error('Error manufacturing drug:', error);
      toast.error('Failed to manufacture drug: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: drugForm.batchId,
          frontendUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQrCodeData(data.data);
        toast.success('QR code generated successfully!');
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeData) return;

    const canvas = document.getElementById('qr-code-canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR-${qrCodeData.batchId}.png`;
    link.href = url;
    link.click();
  };

  if (!account) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please connect your wallet to access the Manufacturer Dashboard.
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
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.15) 0%, rgba(255, 182, 193, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(135, 206, 235, 0.3)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(135, 206, 235, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Factory sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4682B4 0%, #FF69B4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                mb: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              🏭 Manufacturer Dashboard
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.5, color: '#2C3E50', fontWeight: 500 }}>
              Register pharmaceutical products and generate QR codes for tracking
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Drug Registration Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
                Register New Drug
              </Typography>
              
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Batch ID"
                        name="batchId"
                        value={drugForm.batchId}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., BATCH-2024-001"
                      />
                      <Button
                        variant="outlined"
                        onClick={generateBatchId}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Generate
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Drug Name"
                      name="name"
                      value={drugForm.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Paracetamol"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Manufacturer"
                      name="manufacturer"
                      value={drugForm.manufacturer}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., PharmaCorp Ltd."
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expiryDate"
                      type="date"
                      value={drugForm.expiryDate}
                      onChange={handleInputChange}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={drugForm.description}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                      placeholder="Drug description and usage instructions"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dosage"
                      name="dosage"
                      value={drugForm.dosage}
                      onChange={handleInputChange}
                      placeholder="e.g., 500mg tablets"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={manufactureDrug}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Register Drug'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code Display */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
                Generated QR Code
              </Typography>
              
              {qrCodeData ? (
                <Box sx={{
                  textAlign: 'center',
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(255, 182, 193, 0.1) 100%)',
                  borderRadius: 2,
                  border: '2px solid rgba(135, 206, 235, 0.2)',
                }}>
                  <Box sx={{
                    display: 'inline-block',
                    p: 2,
                    background: 'white',
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    mb: 2,
                  }}>
                    <QRCode
                      id="qr-code-canvas"
                      value={qrCodeData.verificationUrl}
                      size={180}
                      level="M"
                      includeMargin
                      fgColor="#2C3E50"
                      bgColor="#FFFFFF"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                    ✅ Batch ID: {qrCodeData.batchId}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📱 Scan to verify drug authenticity
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{
                    mb: 3,
                    display: 'block',
                    wordBreak: 'break-all',
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.7)',
                    p: 1,
                    borderRadius: 1,
                  }}>
                    🔗 {qrCodeData.verificationUrl}
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={downloadQRCode}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 100%)',
                      color: '#2C3E50',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #B0E0E6 0%, #FFC0CB 100%)',
                      },
                    }}
                  >
                    📥 Download QR Code
                  </Button>

                  <Typography variant="caption" sx={{
                    mt: 2,
                    display: 'block',
                    color: '#2C3E50',
                    fontStyle: 'italic',
                  }}>
                    💡 QR code works on any device with internet access
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    QR code will appear here after drug registration
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ManufacturerDashboard;
