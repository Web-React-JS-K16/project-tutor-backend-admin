const Contract = require("../models/contract.model")
const Report = require("../models/report.model")

exports.findAll = async (req, res) => {
    try {

        let { limit, offset } = req.params

        limit = parseInt(limit)
        offset = parseInt(offset)

        const length = await Report.countDocuments()

        const data = await Report.find()
            .limit(limit)
            .skip((offset - 1) * limit)
            .sort({
                createdAt: -1
            })
            .populate({
                path: 'contract',
                populate: [{
                    path: "teacherId",
                    select: ["-password", "-passwordHash", "-hashedPassword"],
                    populate: [{ path: 'district' }, { path: 'city' }],
                },
                {
                    path: "studentId",
                    select: ["-password", "-passwordHash", "-hashedPassword"],
                    populate: [{ path: 'district' }, { path: 'city' }],
                }]
            })

        if (data) {
            return res.status(200).json({ data, length })
        }
        else {
            return res.status(400).json({ message: "Không tồn tại tố cáo." })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

exports.getDetail = async (req, res) => {
    try {
        const { _id } = req.params
        console.log(_id)
        const data = await Report.find({ _id })
            .populate({
                path: "contract",
                populate: [{
                    path: "teacherId",
                    select: ["-password", "-passwordHash", "-hashedPassword"],
                    populate: [{ path: 'district' }, { path: 'city' }],
                },
                {
                    path: "studentId",
                    select: ["-password", "-passwordHash", "-hashedPassword"],
                    populate: [{ path: 'district' }, { path: 'city' }],
                }],
            })

        if (data.length > 0) {
            return res.status(200).json({ data })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu." })
        }

    } catch (err) {
        console.log("err: ", err)
        return res.status(500).json({ message: "Có lỗi xảy ra" });
    }
}
