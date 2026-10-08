const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide stop name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide stop code'],
      uppercase: true,
      trim: true,
      unique: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude'],
    },
    description: {
      type: String,
      default: '',
    },
    facilities: {
      type: [String],
      default: ['Shelter', 'Bench', 'Lighting'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

stopSchema.index({ latitude: 1, longitude: 1 });
stopSchema.index({ active: 1 });

module.exports = mongoose.model('Stop', stopSchema);
