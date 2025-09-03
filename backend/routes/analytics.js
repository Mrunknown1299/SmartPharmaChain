const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');
const Company = require('../models/Company');
const Verification = require('../models/Verification');

// GET /api/analytics/overview - Get general analytics overview
router.get('/overview', async (req, res) => {
  try {
    const [
      totalDrugs,
      totalCompanies,
      totalVerifications,
      recentVerifications
    ] = await Promise.all([
      Drug.countDocuments(),
      Company.countDocuments({ isActive: true }),
      Verification.countDocuments(),
      Verification.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    // Drug status distribution
    const drugStatusStats = await Drug.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Verification results distribution
    const verificationStats = await Verification.aggregate([
      {
        $group: {
          _id: '$verificationResult',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDrugs,
          totalCompanies,
          totalVerifications,
          recentVerifications
        },
        drugStatusDistribution: drugStatusStats,
        verificationResults: verificationStats
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview'
    });
  }
});

// GET /api/analytics/verifications - Get verification analytics
router.get('/verifications', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Get verification stats
    const stats = await Verification.getStats(timeframe);
    
    // Get verification trends (daily counts for the timeframe)
    let days = 7;
    switch(timeframe) {
      case '1h': days = 1; break;
      case '24h': days = 1; break;
      case '7d': days = 7; break;
      case '30d': days = 30; break;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const trends = await Verification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            result: '$verificationResult'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats,
        trends,
        timeframe
      }
    });
  } catch (error) {
    console.error('Error fetching verification analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verification analytics'
    });
  }
});

// GET /api/analytics/drugs - Get drug analytics
router.get('/drugs', async (req, res) => {
  try {
    // Drugs by manufacturer
    const drugsByManufacturer = await Drug.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          count: { $sum: 1 },
          expired: {
            $sum: {
              $cond: ['$isExpired', 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Expiry analysis
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const expiryAnalysis = await Drug.aggregate([
      {
        $facet: {
          expired: [
            { $match: { expiryDate: { $lt: now } } },
            { $count: "count" }
          ],
          expiringSoon: [
            { $match: { 
              expiryDate: { 
                $gte: now, 
                $lte: thirtyDaysFromNow 
              } 
            }},
            { $count: "count" }
          ],
          valid: [
            { $match: { expiryDate: { $gt: thirtyDaysFromNow } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Most verified drugs
    const mostVerified = await Drug.find()
      .sort({ verificationCount: -1 })
      .limit(10)
      .select('batchId name manufacturer verificationCount lastVerified');

    res.json({
      success: true,
      data: {
        drugsByManufacturer,
        expiryAnalysis: {
          expired: expiryAnalysis[0].expired[0]?.count || 0,
          expiringSoon: expiryAnalysis[0].expiringSoon[0]?.count || 0,
          valid: expiryAnalysis[0].valid[0]?.count || 0
        },
        mostVerified
      }
    });
  } catch (error) {
    console.error('Error fetching drug analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drug analytics'
    });
  }
});

// GET /api/analytics/companies - Get company analytics
router.get('/companies', async (req, res) => {
  try {
    const companyStats = await Company.aggregate([
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

    // Recent registrations
    const recentRegistrations = await Company.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name type walletAddress isVerified createdAt');

    res.json({
      success: true,
      data: {
        companyStats,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company analytics'
    });
  }
});

module.exports = router;
