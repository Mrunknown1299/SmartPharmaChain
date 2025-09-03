import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  LocalShipping,
  Store,
  People,
  CheckCircle,
  Warning,
  Timeline,
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const Analytics = () => {
  const { contract } = useWeb3();
  const [analytics, setAnalytics] = useState({
    totalDrugs: 0,
    totalManufacturers: 0,
    totalDistributors: 0,
    totalRetailers: 0,
    recentActivity: [],
    supplyChainHealth: 95,
    verificationRate: 98.5,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [contract]);

  const fetchAnalytics = async () => {
    try {
      // Fetch from backend API
      const response = await fetch('http://localhost:5000/api/analytics/overview');
      const data = await response.json();

      if (data.success) {
        setAnalytics({
          totalDrugs: data.data.overview.totalDrugs || 0,
          totalManufacturers: data.data.overview.totalCompanies || 0,
          totalDistributors: data.data.overview.totalCompanies || 0,
          totalRetailers: data.data.overview.totalCompanies || 0,
          recentActivity: [
            { action: 'Recent Verifications', batch: `${data.data.overview.recentVerifications} in 24h`, time: 'Today', status: 'success' },
            { action: 'Total Drugs', batch: `${data.data.overview.totalDrugs} registered`, time: 'Today', status: 'success' },
            { action: 'Companies Registered', batch: `${data.data.overview.totalCompanies} active`, time: 'Today', status: 'success' },
          ],
          supplyChainHealth: 100,
          verificationRate: 100,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to default values
      setAnalytics({
        totalDrugs: 0,
        totalManufacturers: 0,
        totalDistributors: 0,
        totalRetailers: 0,
        recentActivity: [
          { action: 'No data available', batch: 'Check backend connection', time: 'Now', status: 'error' },
        ],
        supplyChainHealth: 0,
        verificationRate: 0,
      });
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            p: 2, 
            borderRadius: '50%', 
            background: `${color}20`,
            color: color 
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.1) 0%, rgba(255, 182, 193, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(135, 206, 235, 0.2)',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #4682B4 0%, #FF69B4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          📊 Blockchain Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time insights into the pharmaceutical supply chain
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Drugs"
            value={analytics.totalDrugs.toLocaleString()}
            icon={<Inventory sx={{ fontSize: 40 }} />}
            color="#4CAF50"
            subtitle="Tracked on blockchain"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Manufacturers"
            value={analytics.totalManufacturers}
            icon={<People sx={{ fontSize: 40 }} />}
            color="#2196F3"
            subtitle="Registered partners"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Distributors"
            value={analytics.totalDistributors}
            icon={<LocalShipping sx={{ fontSize: 40 }} />}
            color="#FF9800"
            subtitle="Active in network"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Retailers"
            value={analytics.totalRetailers}
            icon={<Store sx={{ fontSize: 40 }} />}
            color="#E91E63"
            subtitle="Serving consumers"
          />
        </Grid>

        {/* Supply Chain Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp /> Supply Chain Health
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overall Health Score</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {analytics.supplyChainHealth}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.supplyChainHealth} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Verification Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {analytics.verificationRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.verificationRate} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Excellent" color="success" size="small" />
                <Chip label="Secure" color="primary" size="small" />
                <Chip label="Transparent" color="info" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline /> Recent Activity
              </Typography>
              
              <List dense>
                {analytics.recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {activity.status === 'success' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.batch} • ${activity.time}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
