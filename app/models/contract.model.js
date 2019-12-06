const EUserType = require('../enums/EContactTypes');
const mongoose = require('mongoose');

const ContractSchema = mongoose.Schema({
    name: String,
    status: {
        type: Number,
        default: EUserType.NOT_START
    },
    isPaid: {
        type: Boolean,
        default: false // False: Chưa thanh toán, True: Đã thanh toán
    },
    content: String,
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    startDate: {
        type: mongoose.Schema.Types.Date,
        default: new Date()
    },
    endDate: {
        type: mongoose.Schema.Types.Date,
        default: new Date()
    },
    costPerHour: mongoose.Schema.Types.Decimal128,
    workingHour: Number
}, {
    timestamps: true
})

module.exports = mongoose.model('Contract', ContractSchema);