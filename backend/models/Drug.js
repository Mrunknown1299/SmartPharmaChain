const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  manufacturerId: {
    type: String,
    trim: true,
    index: true
  },
  distributorId: {
    type: String,
    trim: true,
    index: true
  },
  retailerId: {
    type: String,
    trim: true,
    index: true
  },
  consumerId: {
    type: String,
    trim: true,
    index: true
  },
  manufactureDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  dosage: {
    type: String,
    trim: true,
    default: ''
  },
  sideEffects: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Manufactured', 'Distributed', 'Retailed', 'Sold'],
    default: 'Manufactured'
  },
  isAuthentic: {
    type: Boolean,
    default: true
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  blockchainTxHash: {
    type: String,
    trim: true
  },
  qrCodeData: {
    type: String,
    trim: true
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerified: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if drug is expired
drugSchema.virtual('expired').get(function() {
  return new Date() > this.expiryDate;
});

// Index for efficient queries
drugSchema.index({ batchId: 1, status: 1 });
drugSchema.index({ manufacturerId: 1, status: 1 });
drugSchema.index({ expiryDate: 1 });
drugSchema.index({ createdAt: -1 });

// Pre-save middleware to update isExpired field
drugSchema.pre('save', function(next) {
  this.isExpired = new Date() > this.expiryDate;
  next();
});

// Static method to find by batch ID
drugSchema.statics.findByBatchId = function(batchId) {
  return this.findOne({ batchId });
};

// Instance method to verify drug
drugSchema.methods.verify = function() {
  this.verificationCount += 1;
  this.lastVerified = new Date();
  return this.save();
};

// Instance method to update status
drugSchema.methods.updateStatus = function(newStatus, actorId) {
  this.status = newStatus;
  
  switch(newStatus) {
    case 'Distributed':
      this.distributorId = actorId;
      break;
    case 'Retailed':
      this.retailerId = actorId;
      break;
    case 'Sold':
      this.consumerId = actorId;
      break;
  }
  
  return this.save();
};

module.exports = mongoose.model('Drug', drugSchema);
