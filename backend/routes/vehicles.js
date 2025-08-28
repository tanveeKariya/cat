const express = require('express');
const { protect, ensureDataIsolation } = require('../middlewares/auth');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getVehicleStats
} = require('../controllers/vehicleController');

const router = express.Router();

router.use(protect);
router.use(ensureDataIsolation);

// Special routes first
// CRUD routes
router.route('/')
  .get(getVehicles)
  .post(createVehicle);
router.get('/available/list', getAvailableVehicles);
router.route('/:id')
  .get(getVehicle)
  .put(updateVehicle)
  .delete(deleteVehicle);
router.get('/stats', getVehicleStats);
module.exports = router;