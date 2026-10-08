const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
} = require('../controllers/complaintController');
const { requireAuth, requireStudent, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', requireStudent, createComplaint);
router.put('/:id', requireAdmin, updateComplaint);

module.exports = router;
