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
import TemperatureMonitor from './components/TemperatureMonitor';

// Context
import { Web3Provider } from './context/Web3Context';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Standard MUI Blue
    },
    secondary: {
      main: '#dc004e', // Standard Pink/Red
    },
    background: {
      default: '#f5f5f5',
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
                <Route path="/monitoring" element={<TemperatureMonitor />} />
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
