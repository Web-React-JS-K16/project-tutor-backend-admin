const Tag = require("../models/tag.model")
const Major = require("../models/major.model")

exports.findAll = async (req, res) => {
    try {
        let { limit, offset } = req.params

        limit = parseInt(limit)
        offset = parseInt(offset)

        const length = await Tag.find().countDocuments()

        const data = await Tag.find()
            .limit(limit)
            .skip((offset - 1)*limit)
            .populate('majorId')

        if (data) {
            return res.status(200).json({ data, length })
        }
        return res.status(400).json({ message: "Không có tag nào." })
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Đã có lỗi xảy ra." })
    }
}


/**
 * @param {String} param._id
 */

exports.findOne = async (req, res) => {
    const { _id } = req.params

    if (!_id) {
        return res.status(400).json({ message: "Id tag không được rỗng" })
    }

    try {
        const data = await Tag.findOne({ _id })
            .populate('majorId')

        if (data.length > 0) {
            return res.status(200).json({ data })
        }
        return res.status(400).json({ message: "Không tìm thấy dữ liệu." })
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Đã có lỗi xảy ra." })
    }
}

/**
 * @param {String} body.name
 * @param {String} body.majorId
 */

exports.create = async (req, res) => {

    const { name, majorId } = req.body
    console.log(name, majorId)
    if (!name) {
        return res.status(400).json({ message: "Tên tag không được rỗng" })
    }

    if (!majorId) {
        return res.status(400).json({ message: "Ngành học không được rỗng" })
    }

    try {

        const tag = await Tag.findOne({ name })

        if (tag) {
            return res.status(400).json({ message: "Tên tag đã tồn tại." })
        }

        const newTag = new Tag({
            name,
            majorId
        })

        const result = await newTag.save()

        if (result) {
            const data = await Tag.findOne({ name: result.name })
                .populate('majorId')
            if (data) {
                return res.status(200).json({ message: "Tạo tag kĩ năng thành công.", data })
            }
        }
        else {
            return res.status(400).json({ message: "Tạo tag kĩ năng thất bại." })
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Đã có lỗi xảy ra." })
    }
}

/**
 * @param {String} body._id
 * @param {String} body.name
 * @param {String} body.majorId
 */

exports.update = async (req, res) => {
    console.log(req.body)
    const { _id, name, majorId } = req.body

    if (!_id) {
        return res.status(400).json({ message: "Id không được rỗng" })
    }

    if (!name && !majorId) {
        return res.status(400).json({ message: "Tên tag hoặc ngành học không được rỗng" })
    }

    try {

        const tag = await Tag.findOne({ _id })

        if (tag) {

            const result = await Tag.findOneAndUpdate({ _id }, { name: name || tag.name, majorId: majorId || tag.majorId })
            if (result) {
                const data = await Tag.findOne({ _id: result._id })
                    .populate('majorId')

                if (data) {
                    return res.status(200).json({ message: "Cập nhật tag kĩ năng thành công.", data })
                }
            }
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy tag." })
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Đã có lỗi xảy ra." })
    }
}

/**
 * @param {String} body._id
 */

exports.delete = async (req, res) => {
    const { _id } = req.body
    if (!_id) {
        return res.status(400).json({ message: "Id không được rỗng" })
    }

    try {

        const result = await Tag.findOneAndDelete({ _id })
        if (result) {
            return res.status(200).json({ message: "Xóa tag kĩ năng thành công.", data: result })
        }
        else {
            return res.status(400).json({ message: "Không tìm thấy tag." })
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({ message: "Đã có lỗi xảy ra." })
    }

}