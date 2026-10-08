const Complaint = require('../models/Complaint');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const query = {};
    // If student, only show their own complaints
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const { status, category } = req.query;
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('student', 'name email studentId phone')
      .populate('shuttle', 'shuttleNumber registrationNumber')
      .populate('route', 'routeName routeNumber')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Complaints retrieved successfully', { complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email studentId phone')
      .populate('shuttle', 'shuttleNumber registrationNumber')
      .populate('route', 'routeName routeNumber');

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    if (req.user.role === 'student' && complaint.student._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to view this complaint');
    }

    return successResponse(res, 200, 'Complaint retrieved successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Create complaint / issue report
// @route   POST /api/complaints
// @access  Private/Student
const createComplaint = async (req, res, next) => {
  try {
    const { shuttle, route, category, description } = req.body;

    if (!category || !description) {
      return errorResponse(res, 400, 'Category and description are required');
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      shuttle: shuttle || null,
      route: route || null,
      category,
      description,
      status: 'PENDING',
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId')
      .populate('shuttle', 'shuttleNumber')
      .populate('route', 'routeName routeNumber');

    return successResponse(res, 201, 'Complaint submitted successfully', { complaint: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & response
// @route   PUT /api/complaints/:id
// @access  Private/Admin
const updateComplaint = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;

    await complaint.save();

    const populated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId')
      .populate('shuttle', 'shuttleNumber')
      .populate('route', 'routeName routeNumber');

    return successResponse(res, 200, 'Complaint updated successfully', { complaint: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
};
