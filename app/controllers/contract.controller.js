const Contract = require("../models/contract.model")

exports.findAll = async (req, res) => {
    try {
        let { limit, offset } = req.params

        limit = parseInt(limit)
        offset = parseInt(offset)

        const length = await Contract.find().countDocuments()

        const data = await Contract.find()
            .limit(limit)
            .skip((offset - 1) * limit)
            .populate({
                path: "teacherId",
                select: ["-password", "-passwordHash", "-hashedPassword"]
            })
            .populate({
                path: "studentId",
                select: ["-password", "-passwordHash", "-hashedPassword"]
            })

        if (data) {
            return res.status(200).json({ data, length })
        }
        else {
            return res.status(400).json({ message: "Không tồn tại hợp đồng." })
        }

    } catch (err) {
        console.log("err: ", err)
        return res.status(500).json({ message: "Có lỗi xảy ra" });
    }
}

exports.getDetail = async (req, res) => {
    try {
        const { _id } = req.params
        console.log(_id)
        const data = await Contract.find({ _id })
            .sort({
                createdAt: -1
            })
            .populate({
                path: "teacherId",
                select: ["-password", "-passwordHash", "-hashedPassword"],
                populate: [{ path: 'district' }, { path: 'city' }],
            })
            .populate({
                path: "studentId",
                select: ["-password", "-passwordHash", "-hashedPassword"],
                populate: [{ path: 'district' }, { path: 'city' }],
            })

        if (data) {
            return res.status(200).json({ data })
        }
        else {
            return res.status(400).json({ message: "Không tồn tại hợp đồng." })
        }

    } catch (err) {
        console.log("err: ", err)
        return res.status(500).json({ message: "Có lỗi xảy ra" });
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const { _id, status } = req.body
        console.log(_id, status)
        // await Contract.findOneAndUpdate({_id}, {status}, {new: true})

        const data = await Contract.findOneAndUpdate({ _id }, {
            status,
            $push: { statusHistory: { time: new Date(), status: status } }
        }, { new: true })
        if (data) {
            const _message = data.status === 5 ? "Đã hoàn tất hợp đồng" : "Đã hoàn tiền cho học sinh"
            return res.status(200).json({ data, _message })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy hợp đồng nào!" })
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra" })
    }
}

exports.StatictisByDate = async (req, res) => {
    try {
        const { fromDate, endDate } = req.params

        const data = await Contract.aggregate([
            {
                $match: {
                    $and: [
                        {
                            createdAt: {
                                $gte: new Date(fromDate), $lte: new Date(endDate),
                            }
                        },
                        { status: 5 },
                        { isPaid: true }
                    ]
                },
            },
            {
                $group: {

                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: { total: -1 }
            },
            {
                $match: { count: { $gt: 0 } },
            }
        ])

        if (data.length > 0) {
            return res.status(200).json({ data })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}