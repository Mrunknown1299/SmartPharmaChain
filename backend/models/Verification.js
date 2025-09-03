const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  verifierAddress: {
    type: String,
    trim: true,
    index: true
  },
  verificationResult: {
    type: String,
    enum: ['authentic', 'counterfeit', 'expired', 'not_found'],
    required: true
  },
  verificationMethod: {
    type: String,
    enum: ['blockchain', 'api', 'qr_scan'],
    default: 'api'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  responseTime: {
    type: Number, // in milliseconds
    default: 0
  },
  errorMessage: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
verificationSchema.index({ batchId: 1, createdAt: -1 });
verificationSchema.index({ verifierAddress: 1, createdAt: -1 });
verificationSchema.index({ verificationResult: 1, createdAt: -1 });
verificationSchema.index({ createdAt: -1 });

// Static method to get verification stats
verificationSchema.statics.getStats = function(timeframe = '24h') {
  const now = new Date();
  let startDate;
  
  switch(timeframe) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$verificationResult',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
};

// Static method to get verification history for a batch
verificationSchema.statics.getBatchHistory = function(batchId, limit = 50) {
  return this.find({ batchId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-userAgent -ipAddress');
};

module.exports = mongoose.model('Verification', verificationSchema);
