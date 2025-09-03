const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');
const Company = require('../models/Company');
const Verification = require('../models/Verification');

// GET /api/drugs - Get all drugs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, manufacturer, search } = req.query;
    const query = {};

    // Add filters
    if (status) query.status = status;
    if (manufacturer) query.manufacturer = new RegExp(manufacturer, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { batchId: new RegExp(search, 'i') },
        { manufacturer: new RegExp(search, 'i') }
      ];
    }

    const drugs = await Drug.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Drug.countDocuments(query);

    res.json({
      success: true,
      data: drugs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching drugs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drugs'
    });
  }
});

// GET /api/drugs/:batchId - Get specific drug by batch ID
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const drug = await Drug.findByBatchId(batchId);

    if (!drug) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found'
      });
    }

    // Get verification history
    const verificationHistory = await Verification.getBatchHistory(batchId, 10);

    res.json({
      success: true,
      data: {
        ...drug.toObject(),
        verificationHistory
      }
    });
  } catch (error) {
    console.error('Error fetching drug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drug'
    });
  }
});

// POST /api/drugs - Add new drug to database
router.post('/', async (req, res) => {
  try {
    const {
      batchId,
      name,
      manufacturer,
      manufacturerId,
      manufactureDate,
      expiryDate,
      description,
      dosage,
      sideEffects,
      blockchainTxHash
    } = req.body;

    // Validation
    if (!batchId || !name || !manufacturer || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: batchId, name, manufacturer, expiryDate'
      });
    }

    // Check if drug already exists
    const existingDrug = await Drug.findByBatchId(batchId);
    if (existingDrug) {
      return res.status(409).json({
        success: false,
        error: 'Drug with this batch ID already exists'
      });
    }

    const newDrug = new Drug({
      batchId,
      name,
      manufacturer,
      manufacturerId,
      manufactureDate: manufactureDate || new Date(),
      expiryDate: new Date(expiryDate),
      description: description || '',
      dosage: dosage || '',
      sideEffects: sideEffects || '',
      blockchainTxHash
    });

    await newDrug.save();

    res.status(201).json({
      success: true,
      data: newDrug,
      message: 'Drug added successfully'
    });
  } catch (error) {
    console.error('Error adding drug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add drug',
      details: error.message
    });
  }
});

// PUT /api/drugs/:batchId - Update drug information
router.put('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const drug = await Drug.findByBatchId(batchId);

    if (!drug) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found'
      });
    }

    // Update fields (excluding batchId)
    const updateData = { ...req.body };
    delete updateData.batchId; // Prevent batchId from being changed

    Object.assign(drug, updateData);
    await drug.save();

    res.json({
      success: true,
      data: drug,
      message: 'Drug updated successfully'
    });
  } catch (error) {
    console.error('Error updating drug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update drug',
      details: error.message
    });
  }
});

// DELETE /api/drugs/:batchId - Delete drug (admin only)
router.delete('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const drug = await Drug.findByBatchId(batchId);

    if (!drug) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found'
      });
    }

    await Drug.deleteOne({ batchId });

    res.json({
      success: true,
      data: drug,
      message: 'Drug deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting drug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete drug',
      details: error.message
    });
  }
});

// POST /api/drugs/:batchId/verify - Verify a drug
router.post('/:batchId/verify', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { verifierAddress, method = 'api' } = req.body;

    const drug = await Drug.findByBatchId(batchId);

    let verificationResult;
    if (!drug) {
      verificationResult = 'not_found';
    } else if (drug.expired) {
      verificationResult = 'expired';
    } else if (!drug.isAuthentic) {
      verificationResult = 'counterfeit';
    } else {
      verificationResult = 'authentic';
    }

    // Record verification attempt
    const verification = new Verification({
      batchId,
      verifierAddress,
      verificationResult,
      verificationMethod: method,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await verification.save();

    // Update drug verification count if found
    if (drug) {
      await drug.verify();
    }

    res.json({
      success: true,
      data: {
        batchId,
        isAuthentic: verificationResult === 'authentic',
        isExpired: verificationResult === 'expired',
        verificationResult,
        drug: drug ? drug.toObject() : null
      }
    });
  } catch (error) {
    console.error('Error verifying drug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify drug',
      details: error.message
    });
  }
});

module.exports = router;
