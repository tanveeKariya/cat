const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true,
    index: true
  },
  vehicleId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Car', 'Truck', 'Van', 'SUV', 'Bulldozer', 'Excavator', 'Loader', 'Crane', 'Grader', 'Dump Truck', 'Forklift', 'Backhoe', 'Skid Steer', 'Other']
  },
  model: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: false
  },
  year: {
    type: Number,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  serialNumber: {
    type: String,
    sparse: true
  },
  condition: {
    type: String,
    enum: ['good', 'damaged', 'under_repair', 'needs_inspection'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'rented', 'under_maintenance'],
    default: 'available'
  },
  linkedRentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalHistory',
    default: null
  },
  expectedReturnDate: Date,
  dailyRate: {
    type: Number,
    required: false,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
vehicleSchema.index({ dealerId: 1, status: 1 });
vehicleSchema.index({ dealerId: 1, type: 1 });
vehicleSchema.index({ dealerId: 1, condition: 1 });
vehicleSchema.index({ dealerId: 1, vehicleId: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);