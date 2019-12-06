const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema({
    city: String,
    district: String,
    ward: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Student', StudentSchema);