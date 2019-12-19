const Contact = require("../models/contract.model")

exports.findAll = async (req, res) => {
    try {
        let { limit, offset } = req.params

        limit = parseInt(limit)
        offset = parseInt(offset)

        const length = await Contact.find().countDocuments()

        const data = await Contact.find()
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
        const data = await Contact.find({ _id })
            .populate({
                path: "teacherId",
                select: ["-password", "-passwordHash", "-hashedPassword"],
                populate:  [{ path: 'district' }, { path: 'city' }],
            })
            .populate({
                path: "studentId",
                select: ["-password", "-passwordHash", "-hashedPassword"],
                populate:  [{ path: 'district' }, { path: 'city' }],
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