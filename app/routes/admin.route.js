const express = require("express");
const app = express();
const admins = require("../controllers/admin.controller");

// Retrieve all admin
app.get("/admin", admins.findAll);
app.post("/admin/create", admins.createAdmin);
app.post("/admin/login", admins.login);

module.exports = app;
