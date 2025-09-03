const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  walletAddress: {
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
  type: {
    type: String,
    required: true,
    enum: ['manufacturer', 'distributor', 'retailer'],
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: String,
    trim: true
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

// Index for efficient queries
companySchema.index({ walletAddress: 1, type: 1 });
companySchema.index({ type: 1, isVerified: 1 });
companySchema.index({ name: 'text', email: 'text' });

// Static method to find by wallet address
companySchema.statics.findByWallet = function(walletAddress) {
  return this.findOne({ walletAddress });
};

// Static method to find by type
companySchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Instance method to verify company
companySchema.methods.verify = function(verifierAddress) {
  this.isVerified = true;
  this.verificationDate = new Date();
  this.verifiedBy = verifierAddress;
  return this.save();
};

// Instance method to deactivate company
companySchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Company', companySchema);
