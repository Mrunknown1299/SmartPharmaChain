import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, TextField, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import WarningIcon from '@mui/icons-material/Warning';
import { DeviceThermostat as ThermostatIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
const TemperatureMonitor = () => {
    const { contract, account } = useWeb3();
    const [batchId, setBatchId] = useState('');
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [temperature, setTemperature] = useState(null);
    const [history, setHistory] = useState([]);
    const [violationDetected, setViolationDetected] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    // Refs for interval to clear it properly
    const monitorInterval = useRef(null);

    const [minTemp, setMinTemp] = useState(2);
    const [maxTemp, setMaxTemp] = useState(8);

    // ... (refs)

    const fetchDrugLimits = async () => {
        if (!contract || !batchId) return false;
        try {
            const details = await contract.getDrugDetails(batchId);
            // details[10] is minTemp, details[11] is maxTemp based on new struct order
            // Or access by name if result is object (ethers returns array-like object)
            const min = details.minTemp ? details.minTemp.toNumber() : 2;
            const max = details.maxTemp ? details.maxTemp.toNumber() : 8;
            setMinTemp(min);
            setMaxTemp(max);
            console.log(`Fetched limits: ${min}°C - ${max}°C`);
            return true;
        } catch (error) {
            console.error("Failed to fetch drug limits:", error);
            toast.error("Drug not found or error fetching limits");
            return false;
        }
    };

    const generateTemperature = () => {
        // Generate random around current range
        const rand = Math.random();
        const range = maxTemp - minTemp;
        const center = minTemp + (range / 2);

        let temp;
        if (rand > 0.8) {
            // 20% chance of spike (outside limits)
            temp = Math.random() > 0.5 ?
                (maxTemp + Math.random() * 4) : // Above max
                (minTemp - Math.random() * 4);  // Below min
        } else {
            // 80% chance of being within limits
            temp = minTemp + (Math.random() * range);
        }
        return parseFloat(temp.toFixed(1));
    };

    const handleStartMonitoring = async () => {
        if (!batchId) {
            toast.error('Please enter a Batch ID');
            return;
        }
        if (!contract) {
            toast.error('Contract not connected');
            return;
        }

        const success = await fetchDrugLimits();
        if (!success) return;

        setIsMonitoring(true);
        setViolationDetected(false);
        setHistory([]);

        monitorInterval.current = setInterval(() => {
            const newTemp = generateTemperature();
            setTemperature(newTemp);
            setHistory(prev => [...prev.slice(-9), newTemp]);

            if (newTemp < minTemp || newTemp > maxTemp) {
                handleViolation(newTemp);
            }
        }, 3000);
    };

    // ... (handleStopMonitoring same)

    const handleViolation = async (temp) => {
        clearInterval(monitorInterval.current);
        setViolationDetected(true);
        setIsMonitoring(false);

        try {
            setIsLogging(true);
            toast.warning(`Temperature Violation Detected: ${temp}°C! Logging to Blockchain...`);

            const tempInt = Math.round(temp);
            const tx = await contract.logTemperature(batchId, tempInt);
            await tx.wait();

            toast.success('Violation logged on Blockchain successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to log violation on chain.');
        } finally {
            setIsLogging(false);
        }
    };

    useEffect(() => {
        return () => {
            if (monitorInterval.current) clearInterval(monitorInterval.current);
        };
    }, []);

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(145deg, #ffffff, #f0f4f8)' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center">
                        <ThermostatIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            IoT Monitor
                        </Typography>
                    </Box>
                    <Box>
                        {!isMonitoring ? (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={handleStartMonitoring}
                                startIcon={<PlayArrowIcon />}
                                disabled={isLogging}
                                sx={{ borderRadius: 10 }} // Oval style
                            >
                                Start
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleStopMonitoring}
                                startIcon={<StopIcon />}
                                sx={{ borderRadius: 10 }}
                            >
                                Stop
                            </Button>
                        )}
                    </Box>
                </Box>

                <Typography variant="body1" color="textSecondary" paragraph>
                    Simulate an IoT sensor for a specific drug batch.
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label="Enter Batch ID"
                        variant="outlined"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        disabled={isMonitoring || isLogging}
                        size="small"
                    />
                </Box>

                {temperature !== null && (
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h6" gutterBottom>Live Sensor Reading</Typography>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                border: '8px solid',
                                borderColor: (temperature < minTemp || temperature > maxTemp) ? 'error.main' : 'success.main',
                                bgcolor: 'background.paper',
                                boxShadow: 3
                            }}
                        >
                            <Box>
                                <Typography variant="h2" fontWeight="bold" color={(temperature < minTemp || temperature > maxTemp) ? 'error.main' : 'success.main'}>
                                    {temperature}°C
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary">
                                    {(temperature < minTemp || temperature > maxTemp) ? 'CRITICAL' : 'OPTIMAL'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {violationDetected && (
                    <Alert
                        severity="error"
                        variant="filled"
                        icon={<WarningIcon fontSize="inherit" />}
                        sx={{ mb: 2, fontSize: '1.1rem', alignItems: 'center' }}
                    >
                        CRITICAL ALERT: Temperature excursion detected! Range violated.
                        {isLogging ? " Logging incident to blockchain..." : " Incident logged."}
                    </Alert>
                )}

                {isLogging && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}

                {history.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>Recent Readings</Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {history.map((t, index) => (
                                <Chip
                                    key={index}
                                    label={`${t}°C`}
                                    color={(t < minTemp || t > maxTemp) ? "error" : "success"}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

// Start simple, add Chip import


export default TemperatureMonitor;
