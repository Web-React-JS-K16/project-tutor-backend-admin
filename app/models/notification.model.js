const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    idUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    link: String,
    idDelete:  {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', UserSchema);
