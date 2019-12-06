const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
    message: String,
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Chat', ChatSchema);