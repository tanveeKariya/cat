const express = require('express');
const { protect, ensureDataIsolation } = require('../middlewares/auth');
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);
router.use(ensureDataIsolation);

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPayment)
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;