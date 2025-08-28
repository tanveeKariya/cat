const express = require('express');
const { protect } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');
const Dealer = require('../models/Dealer');

const router = express.Router();

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/settings/profile
// @desc    Get dealer profile settings
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealer._id)
      .select('-password')
      .populate('parentDealer', 'name businessName');

    res.json({
      success: true,
      data: dealer
    });
  } catch (error) {
    console.error('Get profile settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile settings'
    });
  }
});

// @route   PUT /api/settings/profile
// @desc    Update dealer profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Business name must be between 2 and 200 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, businessName, address } = req.body;

    // Check if email is already taken by another dealer
    if (email && email !== req.dealer.email) {
      const existingDealer = await Dealer.findOne({ 
        email, 
        _id: { $ne: req.dealer._id } 
      });
      
      if (existingDealer) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another account'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (businessName) updateData.businessName = businessName;
    if (address) updateData.address = address;

    const dealer = await Dealer.findByIdAndUpdate(
      req.dealer._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: dealer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @route   PUT /api/settings/password
// @desc    Change password
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get dealer with password
    const dealer = await Dealer.findById(req.dealer._id).select('+password');

    // Verify current password
    const isMatch = await dealer.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    dealer.password = newPassword;
    await dealer.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

// @route   PUT /api/settings/preferences
// @desc    Update dealer preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, notifications, language } = req.body;

    const updateData = {};
    if (theme) updateData['preferences.theme'] = theme;
    if (language) updateData['preferences.language'] = language;
    if (notifications) {
      if (notifications.email !== undefined) updateData['preferences.notifications.email'] = notifications.email;
      if (notifications.sms !== undefined) updateData['preferences.notifications.sms'] = notifications.sms;
      if (notifications.push !== undefined) updateData['preferences.notifications.push'] = notifications.push;
    }

    const dealer = await Dealer.findByIdAndUpdate(
      req.dealer._id,
      updateData,
      { new: true }
    ).select('preferences');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: dealer.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
});

// @route   POST /api/settings/staff
// @desc    Create staff account
// @access  Private (Dealer only)
router.post('/staff', protect, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
], handleValidationErrors, async (req, res) => {
  try {
    // Only dealers can create staff accounts
    if (req.dealer.role !== 'dealer') {
      return res.status(403).json({
        success: false,
        message: 'Only dealers can create staff accounts'
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existingDealer = await Dealer.findOne({ email });
    if (existingDealer) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create staff account
    const staff = await Dealer.create({
      name,
      email,
      password,
      phone,
      businessName: req.dealer.businessName,
      role: 'staff',
      parentDealer: req.dealer._id
    });

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating staff account'
    });
  }
});

// @route   GET /api/settings/staff
// @desc    Get all staff accounts
// @access  Private (Dealer only)
router.get('/staff', protect, async (req, res) => {
  try {
    if (req.dealer.role !== 'dealer') {
      return res.status(403).json({
        success: false,
        message: 'Only dealers can view staff accounts'
      });
    }

    const staff = await Dealer.find({
      parentDealer: req.dealer._id,
      role: 'staff'
    }).select('-password');

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff accounts'
    });
  }
});

// @route   PUT /api/settings/staff/:id
// @desc    Update staff account
// @access  Private (Dealer only)
router.put('/staff/:id', protect, async (req, res) => {
  try {
    if (req.dealer.role !== 'dealer') {
      return res.status(403).json({
        success: false,
        message: 'Only dealers can update staff accounts'
      });
    }

    const { isActive } = req.body;

    const staff = await Dealer.findOneAndUpdate(
      { 
        _id: req.params.id, 
        parentDealer: req.dealer._id,
        role: 'staff'
      },
      { isActive },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff account not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff account updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff account'
    });
  }
});

module.exports = router;