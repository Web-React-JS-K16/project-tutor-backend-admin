const Contract = require("../models/contract.model")
const Teacher = require("../models/teacher.model")
const Helpers = require("./../helpers/helpers")

exports.findAll = async (req, res) => {
    try {
        let { limit, offset, status, startDate, endDate, search } = req.params

        limit = parseInt(limit)
        offset = parseInt(offset)
        const objectFilter = {}

        status !== '-1' ? objectFilter.status = status : null
        startDate !== 'null' ? objectFilter.startDate = { $gte: new Date(startDate) } : null
        endDate !== 'null' ? objectFilter.endDate = { $lte: new Date(endDate) } : null

        const length = await Contract.find(objectFilter).countDocuments()
        const data = await Contract.find(objectFilter)
            .limit(limit)
            .skip((offset - 1) * limit)
            .sort({
                startDate: -1
            })
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
            .populate('tags._id')

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

//----------------------------------
exports.changeStatus = async (req, res) => {
    try {
        const { _id, status } = req.body

        const data = await Contract.findOneAndUpdate({ _id }, {
            status,
            endDate: new Date(),
            $push: { statusHistory: { time: new Date(), status: status } }
        }, { new: true })
        if (data) {
            await handleSuccessRate({ _id })
            const _message = "Đã hoàn tiền cho học sinh,Hợp đồng đã bị hủy"
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

exports.changeStatusComplete = async (req, res) => {
    try {
        const { _id, status } = req.body

        const data = await Contract.findOneAndUpdate({ _id }, {
            status,
            endDate: new Date(),
            isPaid: true,
            $push: { statusHistory: { time: new Date(), status: status } }
        }, { new: true })

        if (data) {
            await Teacher.updateOne(
                { userId: data.teacherId },
                { $inc: { jobs: 1, hoursWorked: data.workingHour } }
            )
            await handleSuccessRate({ _id })
            const _message = "Đã chuyển tiền cho giáo viên"
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

//-----------------------------------
exports.StatictisByDate = async (req, res) => {
    try {
        const { fromDate, endDate } = req.params
        let endNewDate = new Date(endDate)
        endNewDate = endNewDate.setDate(endNewDate.getDate() + 1)
        const data = await Contract.aggregate(Helpers.aggregate(fromDate, endNewDate))

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

        const endMonth = parseInt(new Date(endDate).getMonth() + 1)
        const endYear = parseInt(new Date(endDate).getFullYear())

        let fromNewDate = new Date(fromDate)
        fromNewDate.setDate(1)
        const endNewDate = new Date(endYear, endMonth)

        const data = await Contract.aggregate(Helpers.aggregate(fromNewDate, endNewDate))

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

exports.StatictisByWeek = async (req, res) => {
    try {
        const { fromDate, endDate } = req.params

        const fromWeek = Helpers.getNumberOfWeek(fromDate)
        const endWeek = Helpers.getNumberOfWeek(endDate)
        const fromYear = parseInt(new Date(fromDate).getFullYear())
        const endYear = parseInt(new Date(endDate).getFullYear())

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
                    isPaid: "$isPaid",
                }
            },
            {
                $match: {
                    $and: [
                        {
                            year: {
                                $gte: fromYear, $lte: endYear
                            },
                            week: {
                                $gte: fromWeek, $lte: endWeek
                            }
                        },
                        { status: 5 },
                        { isPaid: true }
                    ]
                },
            },
            {
                $group: {
                    _id: { year: "$year", week: "$week" },
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $match: { count: { $gt: 0 } },
            }
        ])

        if (data.length > 0) {
            const newData = data.map(item => {
                const { _id } = item
                return {
                    ...item,
                    _id: `${_id.year}-${_id.week}`,
                }
            })

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
                    _id: { year: "$year" },
                    total: { $sum: { $multiply: ["$costPerHour", "$workingHour"] } },
                    count: { $sum: 1 },
                }
            },
            {
                $sort: { _id: 1 }
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

//-------------------------------------------
exports.StatictisSkillByDate = async (req, res) => {
    try {
        const { endDate } = req.params
        const objectFilter = {}

        endDate !== 'null' ? objectFilter.endDate = {
            $eq: endDate
        } : null

        const data = await Contract.aggregate([
            Helpers.project,
            {
                $match: {
                    $and: [
                        objectFilter,
                        { status: 5 },
                        { isPaid: true },
                        { tags: { $ne: null } }
                    ]
                },
            },
            Helpers.group,
            Helpers.lookup,
            Helpers.sort,
            Helpers.matchResult,
        ])

        if (data.length > 0) {
            return res.status(200).json({ data: Helpers.handleData({ data }) })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

exports.StatictisSkillByWeek = async (req, res) => {
    try {
        const { endDate } = req.params
        const numberWeek = Helpers.getNumberOfWeek(endDate)
        const numberYear = parseInt(new Date(endDate).getFullYear())
        const data = await Contract.aggregate([
            Helpers.project,
            {
                $match: {
                    $and: [
                        {
                            week: {
                                $eq: numberWeek
                            }
                        },
                        {
                            year: {
                                $eq: numberYear
                            }
                        },
                        { status: 5 },
                        { isPaid: true },
                        { tags: { $ne: null } }
                    ]
                },
            },
            Helpers.group,
            Helpers.lookup,
            Helpers.sort,
            Helpers.matchResult,
        ])

        if (data.length > 0) {
            return res.status(200).json({ data: Helpers.handleData({ data }) })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

exports.StatictisSkillByMonth = async (req, res) => {
    try {
        const { endDate } = req.params
        let endNewDate = new Date(endDate)
        endNewDate.setMonth(endNewDate.getMonth() + 1)
        const data = await Contract.aggregate([
            Helpers.project,
            {
                $match: {
                    $and: [
                        {
                            endDate: {
                                $gte: endDate, $lte: endNewDate.toISOString().slice(0, 10),
                            }
                        },
                        { status: 5 },
                        { isPaid: true },
                        { tags: { $ne: null } }
                    ]
                },
            },
            Helpers.group,
            Helpers.lookup,
            Helpers.sort,
            Helpers.matchResult,
        ])

        if (data.length > 0) {
            return res.status(200).json({ data: Helpers.handleData({ data }) })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

exports.StatictisSkillByThreeMonth = async (req, res) => {
    try {
        const { endDate } = req.params
        let endNewDate = new Date(endDate)
        endNewDate.setMonth(endNewDate.getMonth() + 3)

        const data = await Contract.aggregate([
            Helpers.project,
            {
                $match: {
                    $and: [
                        {
                            endDate: {
                                $gte: endDate, $lte: endNewDate.toISOString().slice(0, 10),
                            }
                        },
                        { status: 5 },
                        { isPaid: true },
                        { tags: { $ne: null } }
                    ]
                },
            },
            Helpers.group,
            Helpers.lookup,
            Helpers.sort,
            Helpers.matchResult,
        ])

        if (data.length > 0) {
            return res.status(200).json({ data: Helpers.handleData({ data }) })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy dữ liệu" })
        }
    } catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Có lỗi xảy ra." })
    }
}

const handleSuccessRate = async ({ _id }) => {
    const data = await Contract.findOne({ _id }, { teacherId: 1 })
    const numberContract = await Contract.find({ teacherId: data.teacherId, $or: [{ status: { $eq: 3 } }, { status: { $eq: 5 } }] }).countDocuments()
    const teacher = await Teacher.aggregate([
        {
            $match: {
                userId: data.teacherId
            }
        },
        {
            $addFields: {
                successRate: { $multiply: [{ $divide: ["$jobs", numberContract] }, 100] }
            }
        }])
    await Teacher.updateOne({ _id: teacher[0]._id }, { successRate: teacher[0].successRate.toFixed(2) })
}