const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema(
  {
    name: String,
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('District', DistrictSchema);
