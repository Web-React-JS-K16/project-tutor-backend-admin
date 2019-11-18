const Admin = require("../models/admin.model");
// Retrieving and return all admins to the database
exports.findAll = (req, res) => {
  Admin.find()
    .then(admins => {
      res.send(admins);
    })
    .catch(err => {
      res.status(500).send({
        message: "Some error occurred while retrieving admins"
      });
    });
};

exports.register = (req, res) => {
  if (!req.body.email || !req.body.password) {
      return res.status(400).send({
          message: "email and password not empty."
      })
  }
  Admin.findOne({ email: req.body.email }, (err, data) => {
      if (err) {
          return res.status(500).json(
              "Đã có lỗi xảy ra, vui lòng thử lại."
          );
      }
      if (data) {
          return res.status(400).json("Email đã tồn tại, vui lòng nhập email khác.");
      }
      else {
          const admin = new Admin(req.body)
          admin.setPassword(req.body.password)
          admin.save()
              .then(data => {
                  res.send(data);
              }).catch(err => {
                  return res.status(500).json("Đã có lỗi xảy ra, vui lòng thử lại."
                  );
              });
      }
  })
}