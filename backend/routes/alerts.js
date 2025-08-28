const express = require('express');
const { protect, ensureDataIsolation } = require('../middlewares/auth');
const Alert = require('../models/Alert');
const { generateAllAlerts } = require('../utils/alertGenerator');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for dealer
// @access  Private
router.get('/', protect, ensureDataIsolation, async (req, res) => {
  try {
    const dealerId = req.dealerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const type = req.query.type || '';
    const priority = req.query.priority || '';
    
    // Build query
    let query = { dealerId };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const alerts = await Alert.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
});

// @route   GET /api/alerts/count
// @desc    Get alert counts by status and priority
// @access  Private
router.get('/count', protect, ensureDataIsolation, async (req, res) => {
  try {
    const dealerId = req.dealerId;

    // Generate fresh alerts before counting
    await generateAllAlerts(dealerId);

    const alertCounts = await Alert.aggregate([
      { $match: { dealerId } },
      {
        $group: {
          _id: {
            status: '$status',
            priority: '$priority'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalActive = await Alert.countDocuments({ 
      dealerId, 
      status: 'Active' 
    });

    res.json({
      success: true,
      data: {
        totalActive,
        breakdown: alertCounts
      }
    });
  } catch (error) {
    console.error('Get alert counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert counts'
    });
  }
});

// @route   PUT /api/alerts/:id/acknowledge
// @desc    Acknowledge an alert
// @access  Private
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealerId },
      { 
        status: 'Acknowledged',
        'actionTaken.action': 'Acknowledged',
        'actionTaken.takenBy': req.dealer._id,
        'actionTaken.takenAt': new Date(),
        'actionTaken.notes': req.body.notes || 'Alert acknowledged'
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert'
    });
  }
});

// @route   PUT /api/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const { action, notes } = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealerId },
      { 
        status: 'Resolved',
        resolvedDate: new Date(),
        'actionTaken.action': action,
        'actionTaken.takenBy': req.dealer._id,
        'actionTaken.takenAt': new Date(),
        'actionTaken.notes': notes
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving alert'
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Dismiss an alert
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealerId },
      { status: 'Dismissed' },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert dismissed successfully'
    });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error dismissing alert'
    });
  }
});

module.exports = router;