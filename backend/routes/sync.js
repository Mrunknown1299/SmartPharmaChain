const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');
const Company = require('../models/Company');
const { ethers } = require('ethers');

// Contract ABI (same as in blockchain.js)
const CONTRACT_ABI = [
  "function getDrugDetails(string memory _batchId) public view returns (string memory, string memory, uint256, uint256, uint8, address, address, address, address)",
  "function verifyDrug(string memory _batchId) public view returns (bool)",
  "function isDrugExpired(string memory _batchId) public view returns (bool)"
];

// Initialize provider and contract
let provider;
let contract;

try {
  provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia.infura.io/v3/523a4ac28ec2438db0a237acd57b8eb1");
  const contractAddress = process.env.CONTRACT_ADDRESS || "0xDE6Abac4332b63273595bFe2295D79000599e7aD";
  if (contractAddress) {
    contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
  }
} catch (error) {
  console.error('Blockchain connection error:', error.message);
}

// POST /api/sync/drug/:batchId - Sync specific drug from blockchain to MongoDB
router.post('/drug/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!contract) {
      return res.status(503).json({
        success: false,
        error: 'Smart contract not initialized'
      });
    }

    // Get drug details from blockchain
    const isAuthentic = await contract.verifyDrug(batchId);
    
    if (!isAuthentic) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found on blockchain'
      });
    }

    const drugDetails = await contract.getDrugDetails(batchId);
    const isExpired = await contract.isDrugExpired(batchId);
    
    const [name, manufacturer, manufactureDate, expiryDate, status, manufacturerId, distributorId, retailerId, consumerId] = drugDetails;
    
    // Check if drug already exists in MongoDB
    let drug = await Drug.findByBatchId(batchId);
    
    const drugData = {
      batchId,
      name,
      manufacturer,
      manufacturerId,
      distributorId: distributorId !== ethers.constants.AddressZero ? distributorId : null,
      retailerId: retailerId !== ethers.constants.AddressZero ? retailerId : null,
      consumerId: consumerId !== ethers.constants.AddressZero ? consumerId : null,
      manufactureDate: new Date(manufactureDate.toNumber() * 1000),
      expiryDate: new Date(expiryDate.toNumber() * 1000),
      status: ['Manufactured', 'Distributed', 'Retailed', 'Sold'][status] || 'Unknown',
      isAuthentic: true,
      isExpired
    };

    if (drug) {
      // Update existing drug
      Object.assign(drug, drugData);
      await drug.save();
    } else {
      // Create new drug
      drug = new Drug(drugData);
      await drug.save();
    }

    res.json({
      success: true,
      data: drug,
      message: 'Drug synced successfully from blockchain to MongoDB'
    });

  } catch (error) {
    console.error('Error syncing drug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync drug',
      details: error.message
    });
  }
});

// POST /api/sync/company - Sync company registration to MongoDB
router.post('/company', async (req, res) => {
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
    if (!walletAddress || !name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, name, type'
      });
    }

    // Check if company already exists
    let company = await Company.findByWallet(walletAddress);
    
    if (company) {
      // Update existing company
      company.name = name;
      company.type = type;
      if (email) company.email = email;
      if (phone) company.phone = phone;
      if (address) company.address = address;
      if (licenseNumber) company.licenseNumber = licenseNumber;
      await company.save();
    } else {
      // Create new company
      company = new Company({
        walletAddress,
        name,
        type,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        licenseNumber: licenseNumber || `LIC-${Date.now()}`,
        isVerified: true, // Auto-verify since it's registered by admin
        verificationDate: new Date(),
        verifiedBy: req.body.verifierAddress || 'admin'
      });
      await company.save();
    }

    res.json({
      success: true,
      data: company,
      message: 'Company synced successfully to MongoDB'
    });

  } catch (error) {
    console.error('Error syncing company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync company',
      details: error.message
    });
  }
});

// POST /api/sync/all - Trigger full auto-sync
router.post('/all', async (req, res) => {
  try {
    const { autoSyncStakeholders } = require('../middleware/autoSync');

    // Get all drugs from MongoDB
    const drugs = await Drug.find();
    let syncCount = 0;

    for (const drug of drugs) {
      if (drug.manufacturerId || drug.distributorId || drug.retailerId) {
        await autoSyncStakeholders(drug);
        syncCount++;
      }
    }

    res.json({
      success: true,
      message: `Auto-synced stakeholders for ${syncCount} drugs`,
      data: {
        drugsProcessed: syncCount,
        totalDrugs: drugs.length
      }
    });

  } catch (error) {
    console.error('Error in full sync:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform full sync'
    });
  }
});

// GET /api/sync/status - Check sync status
router.get('/status', async (req, res) => {
  try {
    const mongoStats = {
      totalDrugs: await Drug.countDocuments(),
      totalCompanies: await Company.countDocuments(),
      recentDrugs: await Drug.find().sort({ createdAt: -1 }).limit(5).select('batchId name createdAt'),
      recentCompanies: await Company.find().sort({ createdAt: -1 }).limit(5).select('name type walletAddress')
    };

    res.json({
      success: true,
      data: {
        mongodb: mongoStats,
        blockchain: {
          connected: !!contract,
          contractAddress: process.env.CONTRACT_ADDRESS
        }
      }
    });

  } catch (error) {
    console.error('Error checking sync status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check sync status'
    });
  }
});

module.exports = router;
