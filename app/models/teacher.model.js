const mongoose = require('mongoose');

const TeacherSchema = mongoose.Schema(
  {
    salary: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    about: String,
    successRate: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    tags: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tag'
        },
        name: String,
        majorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Major'
        }
      }
    ],
    jobs: { type: Number, default: 0 },
    hoursWorked: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Teacher', TeacherSchema);