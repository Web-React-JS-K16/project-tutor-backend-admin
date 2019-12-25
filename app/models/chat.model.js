const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
    room: String,
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: [
        {
            time: mongoose.Schema.Types.Date,
            content: String,
            from: mongoose.Schema.Types.ObjectId
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('Chat', ChatSchema);