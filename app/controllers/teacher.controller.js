const Teacher = require("../models/teacher.model");
const User = require("../models/user.model");

//Get all teacher
exports.findAll = async (req, res) => {
    try {
      await Teacher.find()
        .populate({
          path: 'userId',
          // match: { isBlock: false },
          // select: ['-password', '-passwordHash']
        })
        .exec((err, data) => {
          if (err) {
            console.log('err: ', err)
            res.status(500).json({ message: "Có lỗi xảy ra" });
          }
  
          //Get account with isBlock === false 
  
          // const users = data.filter((user) => user.userId !== null)
          // if (users.length === 0) {
          //   return res.status(400).json({ message: "Không tồn tại giáo viên trong database." });
          // }
          // return res.status(200).json({ users: users })
  
          return res.status(200).json({ users: data })
        });
  
    }
    catch (err) {
      console.log("err: ", err)
      return res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }
  