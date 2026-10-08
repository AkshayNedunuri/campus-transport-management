const mongoose = require('mongoose');

const shuttleLocationSchema = new mongoose.Schema(
  {
    shuttle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shuttle',
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

shuttleLocationSchema.index({ shuttle: 1, timestamp: -1 });

module.exports = mongoose.model('ShuttleLocation', shuttleLocationSchema);
