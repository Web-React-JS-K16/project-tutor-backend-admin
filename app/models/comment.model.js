const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    content: String,
    date: {
        type: Date,
        default: new Date()
    },
    ratingStar: Number,
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Comment', CommentSchema);