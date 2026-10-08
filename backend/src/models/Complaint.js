const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shuttle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shuttle',
      default: null,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    category: {
      type: String,
      enum: [
        'Shuttle Delay',
        'Overcrowding',
        'Driver Issue',
        'Route Issue',
        'Shuttle Breakdown',
        'Other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'INVESTIGATING', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminResponse: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
