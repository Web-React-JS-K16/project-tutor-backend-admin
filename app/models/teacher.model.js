const mongoose = require('mongoose');

const TeacherSchema = mongoose.Schema({
    city: String,
    district: String,
    ward: String,
    salary: Number,
    about: String,
    idTags: {
        type: mongoose.Schema.Types.Array,
        default: []
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Teacher', TeacherSchema);