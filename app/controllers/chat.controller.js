const Chat = require("../models/chat.model")
const ObjectId = require("mongodb").ObjectID

exports.findAll = async (req, res) => {
    const { student, teacher } = req.body
    
    try {
        const data = await Chat.find({teacher, student})

        if(data.length > 0) {
            return res.status(200).json({data})
        }
        else {
            return res.status(400).json({message: "Không có tin nhắn"})
        }
    }
    catch (err) {
        console.log('err: ', err)
        return res.status(500).json({message: "Có lỗi xảy ra."})
    }
}
