const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();

// POST /api/qr/generate - Generate QR code for drug batch
router.post('/generate', async (req, res) => {
  try {
    const { batchId, frontendUrl } = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID is required'
      });
    }

    // Create the verification URL
    const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${batchId}`;

    // QR code options
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, qrOptions);

    // Generate QR code as buffer for potential file saving
    const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, qrOptions);

    res.json({
      success: true,
      data: {
        batchId,
        verificationUrl,
        qrCodeDataUrl,
        qrCodeSize: qrCodeBuffer.length,
        generatedAt: new Date().toISOString()
      },
      message: 'QR code generated successfully'
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      details: error.message
    });
  }
});

// GET /api/qr/verify/:batchId - Verify QR code and return drug info
router.get('/verify/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID is required'
      });
    }

    // In a real application, this would query the blockchain
    // For now, we'll return a mock response
    const mockDrugInfo = {
      batchId,
      name: 'Sample Drug',
      manufacturer: 'PharmaCorp',
      manufactureDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'Manufactured',
      isAuthentic: true,
      isExpired: false,
      verificationTimestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockDrugInfo,
      message: 'Drug verification completed'
    });

  } catch (error) {
    console.error('QR Code verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify QR code',
      details: error.message
    });
  }
});

// POST /api/qr/batch-generate - Generate multiple QR codes
router.post('/batch-generate', async (req, res) => {
  try {
    const { batchIds, frontendUrl } = req.body;

    if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array of batch IDs is required'
      });
    }

    if (batchIds.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 QR codes can be generated at once'
      });
    }

    const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCodes = [];

    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };

    for (const batchId of batchIds) {
      try {
        const verificationUrl = `${baseUrl}/verify/${batchId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, qrOptions);
        
        qrCodes.push({
          batchId,
          verificationUrl,
          qrCodeDataUrl,
          status: 'success'
        });
      } catch (error) {
        qrCodes.push({
          batchId,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = qrCodes.filter(qr => qr.status === 'success').length;
    const errorCount = qrCodes.filter(qr => qr.status === 'error').length;

    res.json({
      success: true,
      data: {
        qrCodes,
        summary: {
          total: batchIds.length,
          successful: successCount,
          failed: errorCount
        },
        generatedAt: new Date().toISOString()
      },
      message: `Generated ${successCount} QR codes successfully`
    });

  } catch (error) {
    console.error('Batch QR Code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR codes',
      details: error.message
    });
  }
});

module.exports = router;
