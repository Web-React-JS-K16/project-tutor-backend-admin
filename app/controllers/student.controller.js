const Student = require("../models/student.model");
const User = require("../models/user.model");

//Get all student
exports.findAll = async (req, res) => {
  try {
    let { limit, offset } = req.params

    limit = parseInt(limit)
    offset = parseInt(offset)
    const length = await Student.find().countDocuments()

    const data = await Student.find()
      .limit(limit)
      .skip((offset - 1)*limit)
      .populate({
        path: 'userId',
        // match: { isBlock: false },
        select: ['-password', '-passwordHash']
      })

    //Get account with isBlock === false 

    // const users = data.filter((user) => user.userId !== null)
    // if (users.length === 0) {
    //   return res.status(400).json({ message: "Không tồn tại học sinh trong database." });
    // }
    // return res.status(200).json({ users: users })
    if (data) {
      return res.status(200).json({ data, length })
    }
    else {
      return res.status(400).json({ message: "Không tồn tại học sinh." })
    }


  }
  catch (err) {
    console.log("err: ", err)
    return res.status(500).json({ message: "Có lỗi xảy ra" });
  }
}
