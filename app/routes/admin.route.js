const express = require("express");
const app = express();
const admins = require("../controllers/admin.controller");

// Retrieve all admin
app.get("/admin", admins.findAll);
app.post("/admin/register", admins.register);

module.exports = app;
