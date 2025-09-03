import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import ConsumerVerification from './pages/ConsumerVerification';
import DrugVerification from './pages/DrugVerification';
import Analytics from './pages/Analytics';

// Context
import { Web3Provider } from './context/Web3Context';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#87CEEB', // Sky Blue
      light: '#B0E0E6', // Powder Blue
      dark: '#4682B4', // Steel Blue
      contrastText: '#2C3E50', // Dark Blue-Gray
    },
    secondary: {
      main: '#FFB6C1', // Light Pink
      light: '#FFC0CB', // Pink
      dark: '#FF69B4', // Hot Pink
      contrastText: '#2C3E50',
    },
    background: {
      default: 'linear-gradient(135deg, #FFE5E5 0%, #E5F3FF 50%, #F0E5FF 100%)', // Peach to Sky Blue to Lavender
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#2C3E50', // Dark Blue-Gray for excellent contrast
      secondary: '#34495E', // Slightly lighter dark gray
    },
    success: {
      main: '#98FB98', // Pale Green
      light: '#90EE90', // Light Green
      dark: '#32CD32', // Lime Green
    },
    warning: {
      main: '#FFDAB9', // Peach Puff
      light: '#FFE4B5', // Moccasin
      dark: '#DEB887', // Burlywood
    },
    error: {
      main: '#FFB6C1', // Light Pink
      light: '#FFC0CB', // Pink
      dark: '#FF69B4', // Hot Pink
    },
    info: {
      main: '#87CEEB', // Sky Blue
      light: '#B0E0E6', // Powder Blue
      dark: '#4682B4', // Steel Blue
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14, // Better readable base font size
    h1: { fontWeight: 700, fontSize: '1.6rem' },
    h2: { fontWeight: 600, fontSize: '1.4rem' },
    h3: { fontWeight: 600, fontSize: '1.2rem' },
    h4: { fontWeight: 600, fontSize: '1.1rem' },
    h5: { fontWeight: 500, fontSize: '1rem' },
    h6: { fontWeight: 500, fontSize: '0.95rem' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.85rem' },
    button: { textTransform: 'none', fontWeight: 500, fontSize: '0.9rem' },
    caption: { fontSize: '0.8rem' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid rgba(135, 206, 235, 0.2)',
          boxShadow: '0 8px 32px rgba(135, 206, 235, 0.2)',
          transition: 'all 0.3s ease',
          borderRadius: 16,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 15px 45px rgba(135, 206, 235, 0.3)',
            border: '2px solid rgba(255, 182, 193, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 15px rgba(135, 206, 235, 0.3)',
          fontSize: '0.9rem',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(135, 206, 235, 0.4)',
            transform: 'translateY(-3px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 50%, #FFDAB9 100%)',
          color: '#2C3E50',
          '&:hover': {
            background: 'linear-gradient(135deg, #B0E0E6 0%, #FFC0CB 50%, #FFE4B5 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            padding: '12px 16px',
          },
          '& .MuiInputLabel-root': {
            fontSize: '1rem',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          height: '28px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#333',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3Provider>
        <Router>
          <Box className="App" sx={{ minHeight: '100vh', position: 'relative' }}>
            <Navbar />
            <Box
              component="main"
              sx={{
                pt: 2,
                pb: 4,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/manufacturer" element={<ManufacturerDashboard />} />
                <Route path="/distributor" element={<DistributorDashboard />} />
                <Route path="/retailer" element={<RetailerDashboard />} />
                <Route path="/consumer" element={<ConsumerVerification />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/verify/:batchId" element={<DrugVerification />} />
              </Routes>
            </Box>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
              }}
            />
          </Box>
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
