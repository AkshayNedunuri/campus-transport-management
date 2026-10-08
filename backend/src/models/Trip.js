const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    shuttle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shuttle',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    expectedEndTime: {
      type: Date,
      required: true,
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    currentStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      default: null,
    },
    passengerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ route: 1 });
tripSchema.index({ shuttle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startTime: 1 });

module.exports = mongoose.model('Trip', tripSchema);
