const mongoose = require('mongoose');

const shuttleSchema = new mongoose.Schema(
  {
    shuttleNumber: {
      type: String,
      required: [true, 'Please provide shuttle number (e.g., S-101)'],
      unique: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide vehicle registration number'],
      unique: true,
      trim: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    capacity: {
      type: Number,
      required: true,
      default: 50,
    },
    currentPassengerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DELAYED', 'OFF_DUTY'],
      default: 'INACTIVE',
    },
    currentLocation: {
      latitude: { type: Number, default: 12.9716 },
      longitude: { type: Number, default: 77.5946 },
      speed: { type: Number, default: 0 }, // in km/h
      heading: { type: Number, default: 0 }, // in degrees
      lastUpdated: { type: Date, default: Date.now },
    },
    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

shuttleSchema.virtual('occupancyPercentage').get(function () {
  if (!this.capacity || this.capacity === 0) return 0;
  return Math.min(100, Math.round((this.currentPassengerCount / this.capacity) * 100));
});

shuttleSchema.virtual('occupancyStatus').get(function () {
  const percentage = this.occupancyPercentage;
  if (percentage <= 60) return { label: 'Available', color: 'green', code: 'AVAILABLE' };
  if (percentage <= 80) return { label: 'Moderate', color: 'yellow', code: 'MODERATE' };
  if (percentage <= 95) return { label: 'Crowded', color: 'orange', code: 'CROWDED' };
  return { label: 'Full', color: 'red', code: 'FULL' };
});

shuttleSchema.index({ status: 1 });
shuttleSchema.index({ assignedRoute: 1 });

module.exports = mongoose.model('Shuttle', shuttleSchema);
