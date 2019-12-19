const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', StudentSchema);
