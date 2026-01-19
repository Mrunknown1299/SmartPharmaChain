import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Box,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import {
  Security,
  Visibility,
  Speed,
  VerifiedUser,
  Factory,
  LocalShipping,
  Store,
  QrCodeScanner,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const navigate = useNavigate();
  const { account } = useWeb3();

  const features = [
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Blockchain Security',
      description: 'Immutable records on Ethereum blockchain ensure data integrity and prevent tampering.',
    },
    {
      icon: <Visibility fontSize="large" color="primary" />,
      title: 'Full Transparency',
      description: 'Track every step of the pharmaceutical supply chain from manufacturer to consumer.',
    },
    {
      icon: <Speed fontSize="large" color="primary" />,
      title: 'Real-time Verification',
      description: 'Instant drug authentication using QR codes and smart contracts.',
    },
    {
      icon: <VerifiedUser fontSize="large" color="primary" />,
      title: 'Anti-Counterfeiting',
      description: 'Combat fake drugs with cryptographic proof of authenticity.',
    },
  ];

  const stakeholders = [
    {
      title: 'Manufacturer',
      description: 'Register drugs & initiate tracking.',
      icon: <Factory sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/manufacturer',
      color: 'primary',
    },
    {
      title: 'Distributor',
      description: 'Manage shipping & distribution.',
      icon: <LocalShipping sx={{ fontSize: 48, color: '#9c27b0' }} />,
      path: '/distributor',
      color: 'secondary',
    },
    {
      title: 'Retailer',
      description: 'Stock management & sales.',
      icon: <Store sx={{ fontSize: 48, color: '#2e7d32' }} />,
      path: '/retailer',
      color: 'success',
    },
    {
      title: 'Consumer',
      description: 'Verify authenticity & history.',
      icon: <QrCodeScanner sx={{ fontSize: 48, color: '#ed6c02' }} />,
      path: '/consumer',
      color: 'warning',
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#e3f2fd',
          py: 8,
          textAlign: 'center',
          mb: 6,
          borderBottom: '1px solid #bbdefb'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 800, color: '#0d47a1', letterSpacing: '-1px' }}
          >
            SmartPharmaChain
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
            The Next-Generation Blockchain Solution for <br /> Pharmaceutical Supply Chain Authentication
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            {account ? (
              <Chip
                icon={<CheckCircle />}
                label="Wallet Connected"
                color="success"
                sx={{ px: 2, py: 1, fontSize: '1rem' }}
              />
            ) : (
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ borderRadius: '50px', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              >
                Get Started
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            Why SmartPharmaChain?
          </Typography>
          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      display: 'flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: '#e3f2fd',
                      color: '#1565c0',
                      width: 100,
                      height: 100,
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      mx: 'auto' // Ensure horizontal centering
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stakeholders Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Select Your Role
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 5 }}>
            Access your dedicated dashboard to interact with the supply chain
          </Typography>

          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {stakeholders.map((stakeholder, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    width: '100%',
                    transition: 'all 0.3s ease',
                    borderRadius: 4,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(stakeholder.path)}
                    sx={{ height: '100%', p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        mx: 'auto',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: `${stakeholder.color}.light`,
                        color: `${stakeholder.color}.main`,
                        width: 100,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.9
                      }}
                    >
                      {stakeholder.icon}
                    </Box>
                    <Typography variant="h6" component="div" gutterBottom fontWeight={700}>
                      {stakeholder.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stakeholder.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How It Works Section */}
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4 }}>
            How It Works
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" color="primary" fontWeight={600}>1. Digitization</Typography>
                  <Typography variant="body1">
                    Manufacturers register drugs on the blockchain, assigning a unique identity to every batch.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="primary" fontWeight={600}>2. Tracking</Typography>
                  <Typography variant="body1">
                    Movement is recorded immutably as products flow from distributors to retailers.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" color="primary" fontWeight={600}>3. Verification</Typography>
                  <Typography variant="body1">
                    Stakeholders can verify the provenance and safety of drugs instantly using QR codes.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="primary" fontWeight={600}>4. Trust</Typography>
                  <Typography variant="body1">
                    Consumers can be 100% confident in the authenticity of their medication.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
