const mongoose = require('mongoose');

const CitySchema = mongoose.Schema(
  {
    name: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('City', CitySchema, 'cities');
