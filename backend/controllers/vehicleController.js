const Vehicle = require('../models/Vehicle');
const RentalHistory = require('../models/RentalHistory');

// @desc    Get all vehicles for dealer
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    const dealerId = req.dealerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const status = req.query.status || '';
    const condition = req.query.condition || '';
    
    // Build query
    let query = { dealerId, isActive: true };
    
    if (search) {
      query.$or = [
        { vehicleId: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (condition) query.condition = condition;

    const vehicles = await Vehicle.find(query)
      .populate('linkedRentalId', 'customer_id rented_on')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles'
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      dealerId: req.dealerId
    }).populate('linkedRentalId');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get vehicle's rental history
    const rentalHistory = await RentalHistory.find({ 
      machine_id: vehicle._id,
      dealerId: req.dealerId 
    })
    .populate('customer_id', 'name contact_number')
    .sort({ rented_on: -1 });

    res.json({
      success: true,
      data: {
        vehicle,
        rentalHistory
      }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle'
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
  try {
    const dealerId = req.dealerId;
    
    // Check if vehicle ID already exists for this dealer
    const existingVehicle = await Vehicle.findOne({
      dealerId,
      vehicleId: req.body.vehicleId
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this ID already exists'
      });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      dealerId
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle'
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealerId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle'
    });
  }
};

// @desc    Delete vehicle (soft delete)
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    // Check if vehicle is currently rented
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      dealerId: req.dealerId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.status === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle that is currently rented'
      });
    }

    vehicle.isActive = false;
    await vehicle.save();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle'
    });
  }
};

// @desc    Get available vehicles for rental
// @route   GET /api/vehicles/available/list
// @access  Private
const getAvailableVehicles = async (req, res) => {
  try {
    const dealerId = req.dealerId;
    const type = req.query.type || '';
    
    let query = { 
      dealerId, 
      isActive: true, 
      status: 'available',
      condition: { $in: ['good', 'needs_inspection'] }
    };
    
    if (type) query.type = type;

    const availableVehicles = await Vehicle.find(query)
      .select('vehicleId type model manufacturer year dailyRate')
      .sort({ type: 1, vehicleId: 1 });

    res.json({
      success: true,
      data: availableVehicles
    });
  } catch (error) {
    console.error('Get available vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available vehicles'
    });
  }
};

// @desc    Get vehicle stats for dashboard
// @route   GET /api/vehicles/stats
// @access  Private
const getVehicleStats = async (req, res) => {
  try {
    const dealerId = req.dealerId;

    const stats = await Vehicle.aggregate([
      { $match: { dealerId, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalVehicles = await Vehicle.countDocuments({ dealerId, isActive: true });

    const formattedStats = {
      total: totalVehicles,
      available: 0,
      rented: 0,
      reserved: 0,
      under_maintenance: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle statistics'
    });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getVehicleStats
};