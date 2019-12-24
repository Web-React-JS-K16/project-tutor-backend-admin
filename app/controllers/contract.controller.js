const Contract = require("../models/contract.model")
const Helpers = require("./../helpers/helpers")

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

        const data = await Contract.findOneAndUpdate({ _id }, {
            status,
            endDate: new Date(),
            $push: { statusHistory: { time: new Date(), status: status } }
        }, { new: true })
        if (data) {
            const _message = data.status === 5 ? "Đã hoàn tất hợp đồng" : "Đã hoàn tiền cho học sinh,Hợp đồng đã bị hủy"
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
                            endDate: {
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
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$endDate" } },
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: {_id: 1}
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

exports.StatictisByMonth = async (req, res) => {
    try {
        const { fromDate, endDate } = req.params
        const fromMonth = parseInt(new Date(fromDate).getMonth() + 1)
        const endMonth = parseInt(new Date(endDate).getMonth() + 1)
        const fromYear = parseInt(new Date(fromDate).getFullYear())
        const endYear = parseInt(new Date(endDate).getFullYear() )

        const data = await Contract.aggregate([
            {
                $project:
                  {
                    year: { $year: "$endDate" },
                    month: { $month: "$endDate" },
                    costPerHour: "$costPerHour",
                    endDate: "$endDate",
                    workingHour: "$workingHour",
                    status: "$status",
                    isPaid: "$isPaid"
                  }
              },
            {
                $match: {
                    $and: [
                        {
                            month: {
                                $gte: fromMonth, $lte: endMonth,
                            }
                        },
                        { 
                            year: {
                                $gte: fromYear, $lte: endYear,
                            }
                        },
                        { status: 5 },
                        { isPaid: true }
                    ]
                },
            },
            {
                $group: {
                    _id:  {year:"$year", month:"$month"},
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: {_id: 1}
            },
            {
                $match: { count: { $gt: 0 } },
            }
        ])

        const newData = data.map(item => {
            const { _id } = item
            return {
                ...item,
                _id: new Date(_id.year, _id.month),
            }
        })

        if (newData.length > 0) {
            return res.status(200).json({ data: newData })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

exports.StatictisByWeek = async (req, res) => {
    try {
        const { fromDate, endDate } = req.params
        const fromWeek = Helpers.getNumberOfWeek(fromDate)
        const endWeek = Helpers.getNumberOfWeek(endDate)
        const fromYear = parseInt(new Date(fromDate).getFullYear())
        const endYear = parseInt(new Date(endDate).getFullYear() )

        const data = await Contract.aggregate([
            {
                $project:
                  {
                    year: { $year: "$endDate" },
                    week: { $week: "$endDate" },
                    costPerHour: "$costPerHour",
                    endDate: "$endDate",
                    workingHour: "$workingHour",
                    status: "$status",
                    isPaid: "$isPaid"
                  }
              },
            {
                $match: {
                    $and: [
                        {
                            week: {
                                $gte: fromWeek, $lte: endWeek,
                            }
                        },
                        { 
                            year: {
                                $gte: fromYear, $lte: endYear,
                            }
                        },
                        { status: 5 },
                        { isPaid: true }
                    ]
                },
            },
            {
                $group: {
                    _id:  {year:"$year", week:"$week"},
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: {_id: 1}
            },
            {
                $match: { count: { $gt: 0 } },
            }
        ])

        const newData = data.map(item => {
            const { _id } = item
            return {
                ...item,
                _id: `${_id.year}-${_id.week}`,
            }
        })

        if (newData.length > 0) {
            return res.status(200).json({ data: newData })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

exports.StatictisByYear = async (req, res) => {
    try {
        const { fromYear, endYear } = req.params
        
        const data = await Contract.aggregate([
            {
                $project:
                  {
                    year: { $year: "$endDate" },
                    costPerHour: "$costPerHour",
                    endDate: "$endDate",
                    workingHour: "$workingHour",
                    status: "$status",
                    isPaid: "$isPaid"
                  }
              },
            {
                $match: {
                    $and: [
                        { 
                            year: {
                                $gte: parseInt(fromYear), $lte: parseInt(endYear),
                            }
                        },
                        { status: 5 },
                        { isPaid: true }
                    ]
                },
            },
            {
                $group: {
                    _id:  {year:"$year"},
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: {_id: 1}
            },
            {
                $match: { count: { $gt: 0 } },
            }
        ])

        // const newData = data.map(item => {
        //     const { _id } = item
        //     return {
        //         ...item,
        //         _id: `${_id.year}-${_id.week}`,
        //     }
        // })

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
