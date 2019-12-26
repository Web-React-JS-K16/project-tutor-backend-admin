const Admin = require("../models/admin.model");
const User = require("../models/user.model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");
const EUserTypes = require("../enums/EUserTypes")
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");

// Retrieving and return all admins to the database
exports.findAll = async (req, res) => {
  try {
    const admin = await Admin.find();
    const data = admin.map((item) => {
      const { displayName, email } = item;
      return { displayName, email };
    })
    res.status(200).json({ admin: data })
  }
  catch (err) {
    console.log("err: ", err)
    res.status(500).send({ message: "Có lỗi xảy ra" })

  };
}

/**
 * {body: {email, password, displayName}}
 */
exports.createAdmin = async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).send({
      message: "email and password not empty."
    })
  }
  try {
    const data = await Admin.findOne({ email });
    console.log("data: ", data);
    if (data) {
      return res.status(400).json({ message: "Email đã tồn tại, vui lòng nhập email khác." });
    }
    else {
      const admin = new Admin(req.body)
      admin.setPassword(password)
      const result = await admin.save();
      // console.log("result: ", result);
      if (result) {
        return res.status(200).json({ message: "Tạo tài khoản thành công.", user: req.body });
      } else {
        return res.status(400).json({ message: "Tạo tài khoản thất bại." });
      }
    }
  } catch {
    return res.status(500).json({ message: "Đã có lỗi xảy ra, vui lòng thử lại." });
  }
}

/**
 * login with email and password
 * {body: {email, password}}
 */


// login with email and password
exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      if (admin.validatePassword(password)) {
        const { email, displayName, _id } = admin;
        const token = await jwt.sign(
          { email, displayName, _id },
          jwtSecretConfig.jwtSecret
        );
        return res.status(200).json({ user: { email, displayName, _id, token } });
      }
      return res.status(400).json({ message: "Email hoặc mật khẩu sai." });
    } else {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
  } catch (err) {
    console.log("err: ", err)
    return res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

/**
 * Block account user 
 * @param {String} body._id
 */
exports.blockAccount = async (req, res) => {
  const { _id } = req.body
  try {
    const user = await User.findOneAndUpdate({ _id }, { isBlock: true }, { new: true })

    if (user) {
      const { typeID } = user
      if (parseInt(typeID) === EUserTypes.TEACHER) {
        const data = await Teacher.findOne({ userId: _id })
          .populate({
            path: 'userId',
            select: ['-password', '-passwordHash'],
            populate: [{ path: 'district' }, {path: 'city'}],
          })
          .populate('tags._id')

        if (data) {
          return res.status(200).json({ message: "Tài khoản " + user.displayName + " đã bị khóa.",data })
        }

        return res.status(400).json({ message: "Tài khoản không tồn tại." });
      }
      else {
        const data = await Student.findOne({ userId: _id })
          .populate({
            path: 'userId',
            select: ['-password', '-passwordHash'],
            populate: [{ path: 'district' }, {path: 'city'}],
          })
          return res.status(200).json({ message: "Tài khoản " + user.displayName + " đã bị khóa.", data })
      }
    }
  }
  catch (err) {
    console.log("err: ", err)
    return res.status(500).json({ message: "Có lỗi xảy ra" });
  }
}

/**
 * Unblock account user 
 * @param {String} body._id
 */
exports.upBlockAccount = async (req, res) => {
  const { _id } = req.body

  try {
    const user = await User.findOneAndUpdate({ _id }, { isBlock: false }, { new: true });
    
    if (user) {
      const { typeID } = user
      if (parseInt(typeID) === EUserTypes.TEACHER) {
        const data = await Teacher.findOne({ userId: _id })
          .populate({
            path: 'userId',
            select: ['-password', '-passwordHash'],
            populate: [{ path: 'district' }, {path: 'city'}],
          })
          .populate('tags._id')

        if (data) {
          return res.status(200).json({ message: "Tài khoản " + user.displayName + " đã mở khóa.",data })
        }

        return res.status(400).json({ message: "Tài khoản không tồn tại." });
      }
      else {
        const data = await Student.findOne({ userId: _id })
          .populate({
            path: 'userId',
            select: ['-password', '-passwordHash'],
            populate: [{ path: 'district' }, {path: 'city'}],
          })
          return res.status(200).json({ message: "Tài khoản " + user.displayName + " đã mở khóa.",data })
      }
    }
  }
  catch (err) {
    console.log("err: ", err)
    return res.status(500).json({ message: "Có lỗi xảy ra" });
  }
}