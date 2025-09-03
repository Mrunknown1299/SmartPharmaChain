import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Paper,
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
      description: 'Register new drugs and initiate the supply chain tracking process.',
      icon: <Factory fontSize="large" />,
      path: '/manufacturer',
      color: 'primary',
    },
    {
      title: 'Distributor',
      description: 'Receive and distribute pharmaceutical products in the supply chain.',
      icon: <LocalShipping fontSize="large" />,
      path: '/distributor',
      color: 'secondary',
    },
    {
      title: 'Retailer',
      description: 'Retail pharmaceutical products to end consumers.',
      icon: <Store fontSize="large" />,
      path: '/retailer',
      color: 'success',
    },
    {
      title: 'Consumer',
      description: 'Verify drug authenticity and view complete supply chain history.',
      icon: <QrCodeScanner fontSize="large" />,
      path: '/consumer',
      color: 'warning',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            zIndex: -1,
          }}
        />
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #4682B4 0%, #FF69B4 50%, #DEB887 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
            fontSize: '2rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          🏥 SmartMediChain
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: '#2C3E50',
            mb: 2,
            fontSize: '1.2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          Blockchain-Enabled Pharmaceutical Supply Chain
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            maxWidth: '700px',
            mx: 'auto',
            color: '#34495E',
            lineHeight: 1.6,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Ensuring drug authenticity and safety through transparent, decentralized tracking
          from manufacturer to consumer using Ethereum blockchain and QR code technology.
        </Typography>
        {!account && (
          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
          >
            Get Started
          </Button>
        )}
      </Paper>

      {/* Connection Status */}
      {account && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <VerifiedUser sx={{ color: 'success.main', fontSize: 32 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'success.dark',
                fontWeight: 600,
              }}
            >
              🎉 Wallet Connected - Ready to interact with SmartMediChain
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Features Section */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center', fontSize: '1.1rem' }}>
        Key Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stakeholders Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Stakeholder Dashboards
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stakeholders.map((stakeholder, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Chip
                  icon={stakeholder.icon}
                  label={stakeholder.title}
                  color={stakeholder.color}
                  sx={{ mb: 2, fontSize: '1rem', p: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {stakeholder.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color={stakeholder.color}
                  onClick={() => navigate(stakeholder.path)}
                  sx={{ textTransform: 'none' }}
                >
                  Access Dashboard
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              1. Drug Registration
            </Typography>
            <Typography variant="body2" paragraph>
              Manufacturers register each drug batch on the blockchain with unique identifiers,
              creating an immutable record of origin.
            </Typography>

            <Typography variant="h6" gutterBottom>
              2. Supply Chain Tracking
            </Typography>
            <Typography variant="body2" paragraph>
              Each transfer between distributor, retailer, and consumer is recorded on the
              blockchain, creating a complete audit trail.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              3. QR Code Generation
            </Typography>
            <Typography variant="body2" paragraph>
              Each drug package receives a unique QR code that links to its blockchain record,
              enabling instant verification.
            </Typography>

            <Typography variant="h6" gutterBottom>
              4. Consumer Verification
            </Typography>
            <Typography variant="body2" paragraph>
              Consumers can scan QR codes to verify authenticity, check expiry dates,
              and view the complete supply chain history.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
