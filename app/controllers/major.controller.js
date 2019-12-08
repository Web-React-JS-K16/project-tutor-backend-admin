const Major = require("../models/major.model")
const Tag = require("../models/tag.model")

exports.findAll = async (req, res) => {
    try {
        const majors = await Major.find();

        if(majors) {
            return res.status(200).json({majors: majors})
        }
        
        return res.status(400).json({message: "Không có ngành học nào."})
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({message: "Đã có lỗi xảy ra."})
    }
}

/**
 * @param {String} param._id
 */


exports.findOne = async (req, res) => {
    const { _id } = req.params

    if(!_id) {
        return res.status(400).json({message: "Id ngành học không được rỗng"})
    }

    try {
        const major = await Major.findOne({_id});

        if(major) {
            return res.status(200).json({major: major})
        }
        
        return res.status(400).json({message: "Không có ngành học nào."})
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({message: "Đã có lỗi xảy ra."})
    }
}

/**
 * @param {String} body.name
 */

exports.create = async (req, res) => {
    
    const { name } = req.body

    if(!name) {
        return res.status(400).json({message: "Tên ngành học không được rỗng"})
    }

    try {

        const major = await Major.findOne({name})

        if(major) {
            return res.status(400).json({message: "Ngành học đã tồn tại"})
        }

        const newMajor = new Major({
            name
        })

        const result = await newMajor.save()

        if(result) {
            return res.status(200).json({message: "Tạo ngành học thành công."})
        }
        else {
            return res.status(200).json({message: "Tạo ngành học thất bại."})
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({message: "Đã có lỗi xảy ra."})
    }
}

/**
 * @param {String} body._id
* @param {String} body.name
 */

 exports.update = async (req, res) => {
    const { _id, name } = req.body

    if(!_id) {
        return res.status(400).json({message: "Id không được rỗng"})
    }

    if(!name) {
        return res.status(400).json({message: "Tên không được rỗng"})
    }

    try {
        
        const result = await Major.findOneAndUpdate({_id}, {name})

        if(result) {
            return res.status(200).json({message: "Cập nhật ngành học thành công."})
        }
        else {
            return res.status(200).json({message: "Không tìm thấy ngành học."})
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({message: "Đã có lỗi xảy ra."})
    }
}

/**
 * @param {String} body._id
 */

 exports.delete = async (req, res) => {
    const { _id } = req.body

    if(!_id) {
        return res.status(400).json({message: "Id không được rỗng"})
    }

    try {
        
        const tag = await Tag.findOne({majorId: _id})

        if(tag) {
            return res.status(200).json({message: "Không thể xóa ngành học vì tag có tồn tại trong database."})
        }

        const result = await Major.findOneAndDelete({_id})

        if(result) {
            return res.status(200).json({message: "Xóa ngành học thành công."})
        }
        else {
            return res.status(200).json({message: "Không tìm thấy ngành học."})
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({message: "Đã có lỗi xảy ra."})
    }

 }