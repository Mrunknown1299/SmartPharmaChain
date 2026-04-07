const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();
const Drug = require('../models/Drug');
const Verification = require('../models/Verification');
const { autoSyncStakeholders } = require('../middleware/autoSync');

// Mock contract ABI - In production, import from artifacts
const CONTRACT_ABI = [
  "function manufactureDrug(string memory _batchId, string memory _name, string memory _manufacturer, uint256 _expiryDate) public",
  "function distributeDrug(string memory _batchId) public",
  "function retailDrug(string memory _batchId) public",
  "function sellDrug(string memory _batchId, address _consumer) public",
  "function getDrugDetails(string memory _batchId) public view returns (string memory, string memory, uint256, uint256, uint8, address, address, address, address)",
  "function verifyDrug(string memory _batchId) public view returns (bool)",
  "function isDrugExpired(string memory _batchId) public view returns (bool)"
];

// Initialize provider (you'll need to configure this based on your network)
let provider;
let contract;

try {
  // For local development
  provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
  
  // Contract address will be set after deployment
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (contractAddress) {
    contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
  }
} catch (error) {
  console.error('Blockchain connection error:', error.message);
}

// GET /api/blockchain/status - Check blockchain connection status
router.get('/status', async (req, res) => {
  try {
    if (!provider) {
      return res.status(503).json({
        success: false,
        error: 'Blockchain provider not initialized'
      });
    }

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    res.json({
      success: true,
      data: {
        connected: true,
        network: network.name,
        chainId: network.chainId,
        blockNumber,
        contractAddress: process.env.CONTRACT_ADDRESS || 'Not deployed'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check blockchain status',
      details: error.message
    });
  }
});

// GET /api/blockchain/drug/:batchId - Get drug details from blockchain
router.get('/drug/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!contract) {
      return res.status(503).json({
        success: false,
        error: 'Smart contract not initialized'
      });
    }

    // Call the smart contract
    const drugDetails = await contract.getDrugDetails(batchId);
    
    // Parse the returned data
    const [name, manufacturer, manufactureDate, expiryDate, status, manufacturerId, distributorId, retailerId, consumerId] = drugDetails;

    const statusNames = ['Manufactured', 'Distributed', 'Retailed', 'Sold'];

    res.json({
      success: true,
      data: {
        batchId,
        name,
        manufacturer,
        manufactureDate: new Date(manufactureDate.toNumber() * 1000).toISOString(),
        expiryDate: new Date(expiryDate.toNumber() * 1000).toISOString(),
        status: statusNames[status] || 'Unknown',
        statusCode: status,
        manufacturerId,
        distributorId: distributorId !== ethers.constants.AddressZero ? distributorId : null,
        retailerId: retailerId !== ethers.constants.AddressZero ? retailerId : null,
        consumerId: consumerId !== ethers.constants.AddressZero ? consumerId : null
      }
    });

  } catch (error) {
    console.error('Blockchain query error:', error);
    
    if (error.message.includes('Drug does not exist')) {
      return res.status(404).json({
        success: false,
        error: 'Drug not found on blockchain'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch drug from blockchain',
      details: error.message
    });
  }
});

// POST /api/blockchain/verify/:batchId - Verify drug authenticity
router.post('/verify/:batchId', async (req, res) => {
  const startTime = Date.now();
  try {
    const { batchId } = req.params;
    const { verifierAddress } = req.body;

    let verificationResult = 'not_found';
    let drugData = null;
    let isAuthentic = false;
    let isExpired = false;

    // First try to get from MongoDB
    let drug = await Drug.findByBatchId(batchId);

    if (drug) {
      isAuthentic = drug.isAuthentic;
      isExpired = drug.expired;
      drugData = drug.toObject();

      if (!isAuthentic) {
        verificationResult = 'counterfeit';
      } else if (isExpired) {
        verificationResult = 'expired';
      } else {
        verificationResult = 'authentic';
      }
    } else if (contract) {
      // Fallback to blockchain if not in MongoDB
      try {
        isAuthentic = await contract.verifyDrug(batchId);

        if (isAuthentic) {
          const drugDetails = await contract.getDrugDetails(batchId);
          isExpired = await contract.isDrugExpired(batchId);

          const [name, manufacturer, manufactureDate, expiryDate, status, manufacturerId, distributorId, retailerId, consumerId] = drugDetails;

          drugData = {
            batchId,
            name,
            manufacturer,
            manufactureDate: new Date(manufactureDate.toNumber() * 1000),
            expiryDate: new Date(expiryDate.toNumber() * 1000),
            status: ['Manufactured', 'Distributed', 'Retailed', 'Sold'][status] || 'Unknown',
            manufacturerId,
            distributorId: distributorId !== ethers.constants.AddressZero ? distributorId : null,
            retailerId: retailerId !== ethers.constants.AddressZero ? retailerId : null,
            consumerId: consumerId !== ethers.constants.AddressZero ? consumerId : null,
            source: 'blockchain'
          };

          verificationResult = isExpired ? 'expired' : 'authentic';
        }
      } catch (blockchainError) {
        console.error('Blockchain verification failed:', blockchainError);
      }
    }

    // Auto-sync blockchain data to MongoDB if not exists
    if (!drug && isAuthentic && drugData) {
      try {
        const newDrug = new Drug({
          batchId: drugData.batchId,
          name: drugData.name,
          manufacturer: drugData.manufacturer,
          manufacturerId: drugData.manufacturerId,
          distributorId: drugData.distributorId,
          retailerId: drugData.retailerId,
          consumerId: drugData.consumerId,
          manufactureDate: drugData.manufactureDate,
          expiryDate: drugData.expiryDate,
          status: drugData.status,
          isAuthentic: true,
          isExpired: drugData.isExpired || false,
          blockchainTxHash: 'auto-synced'
        });

        await newDrug.save();
        console.log(`✅ Auto-synced drug ${batchId} from blockchain to MongoDB`);
        drug = newDrug;

        // Auto-sync all stakeholders
        await autoSyncStakeholders(drugData);
      } catch (syncError) {
        console.error('Auto-sync error:', syncError);
      }
    }

    // Record verification attempt
    const responseTime = Date.now() - startTime;
    const verification = new Verification({
      batchId,
      verifierAddress,
      verificationResult,
      verificationMethod: 'blockchain',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime
    });

    await verification.save();

    // Update drug verification count if found in MongoDB
    if (drug) {
      await drug.verify();
    }

    res.json({
      success: true,
      data: {
        batchId,
        isAuthentic,
        isExpired,
        verificationResult,
        verificationTimestamp: new Date().toISOString(),
        responseTime,
        ...drugData
      }
    });

  } catch (error) {
    console.error('Verification error:', error);

    // Record failed verification
    const responseTime = Date.now() - startTime;
    try {
      const verification = new Verification({
        batchId: req.params.batchId,
        verifierAddress: req.body.verifierAddress,
        verificationResult: 'not_found',
        verificationMethod: 'blockchain',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime,
        errorMessage: error.message
      });
      await verification.save();
    } catch (dbError) {
      console.error('Failed to save verification error:', dbError);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to verify drug',
      details: error.message
    });
  }
});

// GET /api/blockchain/contract-info - Get contract information
router.get('/contract-info', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        contractAddress: process.env.CONTRACT_ADDRESS || 'Not deployed',
        networkUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
        abi: CONTRACT_ABI
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get contract info',
      details: error.message
    });
  }
});

module.exports = router;
