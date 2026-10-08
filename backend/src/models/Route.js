const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: [true, 'Please provide route name'],
      trim: true,
    },
    routeNumber: {
      type: String,
      required: [true, 'Please provide route number'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    stops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
      },
    ],
    estimatedDuration: {
      type: Number, // in minutes
      required: true,
      default: 20,
    },
    active: {
      type: Boolean,
      default: true,
    },
    operatingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    color: {
      type: String,
      default: '#4f46e5',
    },
  },
  {
    timestamps: true,
  }
);

routeSchema.index({ active: 1 });

module.exports = mongoose.model('Route', routeSchema);
