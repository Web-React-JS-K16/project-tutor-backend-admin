const mongoose = require('mongoose');

const TeacherSchema = mongoose.Schema(
  {
    city: String,
    district: String,
    ward: String,
    salary: { type: Number, default: 0 },
    about: String,
    successRate: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    tags: [
      {
        tagId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tag'
        },
        name: String,
        major: {
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

TeacherSchema.methods.setUserId = function(userId) {
  this.userId = userId;
};

TeacherSchema.methods.setTags = function(tags) {
  this.tags = tags;
};

module.exports = mongoose.model('Teacher', TeacherSchema);
