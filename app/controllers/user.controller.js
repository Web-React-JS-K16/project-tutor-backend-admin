const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");
const User = require("../models/user.model");
const EUserTypes = require("../enums/EUserTypes")

/**
 * User register
 * @param {String} body._id 
 * _id is id of User not _id of Student or Teacher
 */
exports.getInforUser = async (req, res) => {
    const { _id } = req.body
  
    try {
  
      const user = await User.findOne({ _id })
  
      if (user) {
        const { typeID } = user
        if (parseInt(typeID) === EUserTypes.TEACHER) {
          await Teacher.findOne({ userId: _id })
            .populate({
              path: 'userId',
              // select: ['-password', '-passwordHash']
            })
            .exec((err, data) => {
              if (err) {
                console.log('err: ', err)
                res.status(500).json({ message: "Có lỗi xảy ra" });
              }
  
              if(data) {
                return res.status(200).json({ user: data })
              }
              
              return  res.status(400).json({ message: "Tài khoản không tồn tại." });
             
            });
        }
        else {
          await Student.findOne({  userId: _id })
            .populate({
              path: 'userId',
              // select: ['-password', '-passwordHash']
            })
            .exec((err, data) => {
              if (err) {
                console.log('err: ', err)
                res.status(500).json({ message: "Có lỗi xảy ra" });
              }
              return res.status(200).json({ user: data })
            });
        }
      }
      else {
        return res.status(400).json({ message: "Không tìm thấy tài khoản người dùng" })
      }
    }
    catch (err) {
      console.log("err: ", err)
      return res.status(500).json({ message: "Đã có lỗi xảy ra" })
    }
  
  }
  