const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/companies - Get all companies
router.get('/', async (req, res) => {
  try {
    const { type, verified, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (type) query.type = type;
    if (verified !== undefined) query.isVerified = verified === 'true';
    
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-metadata')
      .exec();
      
    const total = await Company.countDocuments(query);
    
    res.json({
      success: true,
      data: companies,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies'
    });
  }
});

// GET /api/companies/:walletAddress - Get specific company
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    let company = await Company.findByWallet(walletAddress);

    if (!company) {
      // Auto-create company with default name if not found
      const defaultNames = {
        manufacturer: 'Pharmaceutical Manufacturer',
        distributor: 'Medical Distributor',
        retailer: 'Pharmacy Retailer'
      };

      // Try to determine type from context or default to manufacturer
      const type = req.query.type || 'manufacturer';
      const shortAddress = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);

      company = new Company({
        walletAddress,
        name: `${defaultNames[type]} (${shortAddress})`,
        type,
        email: `${type}${Date.now()}@smartmedichain.com`,
        licenseNumber: `LIC-${Date.now()}`,
        isVerified: true,
        verificationDate: new Date(),
        verifiedBy: 'auto-system'
      });

      await company.save();
      console.log(`✅ Auto-created company for ${walletAddress}`);
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company'
    });
  }
});

// POST /api/companies - Register new company
router.post('/', async (req, res) => {
  try {
    const {
      walletAddress,
      name,
      type,
      email,
      phone,
      address,
      licenseNumber
    } = req.body;

    // Validation
    if (!walletAddress || !name || !type || !email || !licenseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findByWallet(walletAddress);
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        error: 'Company with this wallet address already exists'
      });
    }

    const newCompany = new Company({
      walletAddress,
      name,
      type,
      email,
      phone,
      address,
      licenseNumber
    });

    await newCompany.save();

    res.status(201).json({
      success: true,
      data: newCompany,
      message: 'Company registered successfully'
    });
  } catch (error) {
    console.error('Error registering company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register company',
      details: error.message
    });
  }
});

// PUT /api/companies/:walletAddress/verify - Verify company (admin only)
router.put('/:walletAddress/verify', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { verifierAddress } = req.body;
    
    const company = await Company.findByWallet(walletAddress);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    await company.verify(verifierAddress);

    res.json({
      success: true,
      data: company,
      message: 'Company verified successfully'
    });
  } catch (error) {
    console.error('Error verifying company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify company'
    });
  }
});

// GET /api/companies/stats/overview - Get company statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Company.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          verified: {
            $sum: {
              $cond: ['$isVerified', 1, 0]
            }
          },
          active: {
            $sum: {
              $cond: ['$isActive', 1, 0]
            }
          }
        }
      }
    ]);

    const totalCompanies = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });

    res.json({
      success: true,
      data: {
        total: totalCompanies,
        verified: verifiedCompanies,
        byType: stats
      }
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company statistics'
    });
  }
});

module.exports = router;
