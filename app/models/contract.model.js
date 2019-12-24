const eContractTypes = require('../enums/EContractTypes');
const mongoose = require('mongoose');

const ContractSchema = mongoose.Schema(
  {
    name: String,
    statusHistory: {
      type: Array,
      default: { time: new Date(), status: eContractTypes.WAIT_FOR_PAYMENT }
    },
    status: {
      type: Number,
      default: eContractTypes.WAIT_FOR_PAYMENT
    },
    isPaid: {
      type: Boolean,
      default: false // False: Chưa thanh toán, True: Đã thanh toán
    },
    content: String,
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startDate: {
      type: mongoose.Schema.Types.Date
      // default: new Date()
    },
    endDate: {
      type: mongoose.Schema.Types.Date
      // default: new Date()
    },
    costPerHour: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    workingHour: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Contract', ContractSchema);
