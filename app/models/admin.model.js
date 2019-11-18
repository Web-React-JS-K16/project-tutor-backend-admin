const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const AdminSchema = mongoose.Schema({
  email: String,
  password: String,
  passwordHash: String,
  displayName: String,
  phone: String,
  birthday: Date,
},{
  timestamps: true
});

AdminSchema.methods.setPassword = function (password) {
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

AdminSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

module.exports = mongoose.model("Admin", AdminSchema);
