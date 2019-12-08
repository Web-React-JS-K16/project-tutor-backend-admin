const mongoose = require('mongoose');

const MajorSchema = mongoose.Schema({
    name: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Major', MajorSchema);