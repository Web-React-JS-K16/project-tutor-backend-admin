const express = require("express");
const app = express();
const admins = require("../controllers/admin.controller");

// Retrieve all admin
app.get("/admin", admins.findAll);
app.post("/admin/create", admins.createAdmin);
app.post("/admin/login", admins.login);

app.get("/admin/student", admins.findAllStudent)
app.get("/admin/teacher", admins.findAllTeacher)
app.get("/admin/info-user", admins.getInforUser)
app.post("/admin/block-account", admins.blockAccount)
app.post("/admin/unblock-account", admins.upBlockAccount)

module.exports = app;
