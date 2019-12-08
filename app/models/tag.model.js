const mongoose = require('mongoose');

const TagSchema = mongoose.Schema(
  {
    name: String,
    majorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Tag', TagSchema);
