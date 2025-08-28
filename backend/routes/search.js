const express = require('express');
const { protect, ensureDataIsolation } = require('../middlewares/auth');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');

const router = express.Router();

// @route   GET /api/search
// @desc    Global search across customers, vehicles, and rentals
// @access  Private
router.get('/', protect, ensureDataIsolation, async (req, res) => {
  try {
    const dealerId = req.dealerId;
    const { query, type, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const results = {
      customers: [],
      vehicles: [],
      rentals: []
    };

    // Search customers
    if (!type || type === 'customers') {
      results.customers = await Customer.find({
        dealerId,
        isActive: true,
        $or: [
          { name: searchRegex },
          { customerId: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { businessType: searchRegex }
        ]
      })
      .select('customerId name email phone businessType totalRentals currentBalance')
      .limit(parseInt(limit));
    }

    // Search vehicles
    if (!type || type === 'vehicles') {
      results.vehicles = await Vehicle.find({
        dealerId,
        isActive: true,
        $or: [
          { vehicleId: searchRegex },
          { type: searchRegex },
          { model: searchRegex },
          { manufacturer: searchRegex },
          { serialNumber: searchRegex }
        ]
      })
      .select('vehicleId type model manufacturer year status condition dailyRate')
      .populate('currentRental', 'rentalId customerId expectedEndDate')
      .limit(parseInt(limit));
    }

    // Search rentals
    if (!type || type === 'rentals') {
      results.rentals = await Rental.find({
        dealerId,
        $or: [
          { rentalId: searchRegex },
          { status: searchRegex }
        ]
      })
      .select('rentalId status startDate expectedEndDate totalAmount')
      .populate('customerId', 'name customerId')
      .populate('vehicleId', 'vehicleId type model')
      .limit(parseInt(limit));
    }

    // Calculate total results
    const totalResults = results.customers.length + results.vehicles.length + results.rentals.length;

    res.json({
      success: true,
      query,
      totalResults,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search'
    });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Private
router.get('/suggestions', protect, ensureDataIsolation, async (req, res) => {
  try {
    const dealerId = req.dealerId;
    const { query } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const suggestions = [];

    // Get customer suggestions
    const customers = await Customer.find({
      dealerId,
      isActive: true,
      $or: [
        { name: searchRegex },
        { customerId: searchRegex }
      ]
    })
    .select('customerId name')
    .limit(5);

    customers.forEach(customer => {
      suggestions.push({
        type: 'customer',
        id: customer._id,
        text: `${customer.name} (${customer.customerId})`,
        category: 'Customers'
      });
    });

    // Get vehicle suggestions
    const vehicles = await Vehicle.find({
      dealerId,
      isActive: true,
      $or: [
        { vehicleId: searchRegex },
        { type: searchRegex },
        { model: searchRegex }
      ]
    })
    .select('vehicleId type model')
    .limit(5);

    vehicles.forEach(vehicle => {
      suggestions.push({
        type: 'vehicle',
        id: vehicle._id,
        text: `${vehicle.vehicleId} - ${vehicle.type} ${vehicle.model}`,
        category: 'Vehicles'
      });
    });

    // Get rental suggestions
    const rentals = await Rental.find({
      dealerId,
      rentalId: searchRegex
    })
    .select('rentalId status')
    .populate('customerId', 'name')
    .limit(5);

    rentals.forEach(rental => {
      suggestions.push({
        type: 'rental',
        id: rental._id,
        text: `${rental.rentalId} - ${rental.customerId.name}`,
        category: 'Rentals'
      });
    });

    res.json({
      success: true,
      data: suggestions.slice(0, 15) // Limit total suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching search suggestions'
    });
  }
});

module.exports = router;