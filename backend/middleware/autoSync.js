const Company = require('../models/Company');
const Drug = require('../models/Drug');

// Auto-sync company based on blockchain interaction
const autoSyncCompany = async (walletAddress, type, drugData = null) => {
  try {
    let company = await Company.findByWallet(walletAddress);
    
    if (!company) {
      // Generate company name based on type and address
      const companyNames = {
        manufacturer: [
          'PharmaCorp Industries',
          'MediTech Solutions', 
          'HealthPharma Ltd',
          'BioMed Manufacturing',
          'Global Pharmaceuticals',
          'Advanced Drug Systems'
        ],
        distributor: [
          'MediDistribute Co.',
          'PharmaLogistics Inc.',
          'HealthSupply Chain',
          'MedTransport Ltd',
          'Global Med Distribution',
          'Pharma Connect'
        ],
        retailer: [
          'HealthMart Pharmacy',
          'CityMed Drugstore', 
          'WellCare Pharmacy',
          'MediPlus Store',
          'Community Health Pharmacy',
          'Express Medical Store'
        ]
      };
      
      // Use address to pick consistent company name
      const addressNum = parseInt(walletAddress.slice(-4), 16);
      const nameIndex = addressNum % companyNames[type].length;
      const companyName = companyNames[type][nameIndex];
      
      company = new Company({
        walletAddress,
        name: companyName,
        type,
        email: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@smartmedichain.com`,
        phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} Medical Plaza`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          country: 'USA',
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
        },
        licenseNumber: `${type.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        isVerified: true,
        verificationDate: new Date(),
        verifiedBy: 'blockchain-auto-sync'
      });
      
      await company.save();
      console.log(`✅ Auto-created ${type} company: ${companyName} for ${walletAddress.slice(0, 8)}...`);
    }
    
    return company;
  } catch (error) {
    console.error(`Error auto-syncing ${type} company:`, error);
    return null;
  }
};

// Detect company type from blockchain transaction
const detectCompanyType = (drugData, walletAddress) => {
  if (!drugData) return 'manufacturer'; // Default
  
  if (drugData.manufacturerId === walletAddress) return 'manufacturer';
  if (drugData.distributorId === walletAddress) return 'distributor';
  if (drugData.retailerId === walletAddress) return 'retailer';
  
  return 'manufacturer'; // Default fallback
};

// Auto-sync all stakeholders from drug data
const autoSyncStakeholders = async (drugData) => {
  const promises = [];
  
  if (drugData.manufacturerId) {
    promises.push(autoSyncCompany(drugData.manufacturerId, 'manufacturer', drugData));
  }
  
  if (drugData.distributorId) {
    promises.push(autoSyncCompany(drugData.distributorId, 'distributor', drugData));
  }
  
  if (drugData.retailerId) {
    promises.push(autoSyncCompany(drugData.retailerId, 'retailer', drugData));
  }
  
  try {
    await Promise.all(promises);
    console.log('✅ Auto-synced all stakeholders for drug:', drugData.batchId);
  } catch (error) {
    console.error('Error auto-syncing stakeholders:', error);
  }
};

// Middleware to auto-sync on verification
const autoSyncMiddleware = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    // If this is a successful verification with drug data, auto-sync
    if (data.success && data.data && data.data.batchId) {
      // Don't await - run in background
      autoSyncStakeholders(data.data).catch(console.error);
    }
    
    // Call original res.json
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  autoSyncCompany,
  detectCompanyType,
  autoSyncStakeholders,
  autoSyncMiddleware
};
