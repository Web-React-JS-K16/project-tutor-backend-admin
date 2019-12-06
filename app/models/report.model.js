const mongoose = require('mongoose')

const ReportSchema = mongoose.Schema({
    name: String,
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Report', ReportSchema);
