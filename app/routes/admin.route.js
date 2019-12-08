const express = require("express");
const app = express();
const admins = require("../controllers/admin.controller");

// Retrieve all admin
app.get("/", admins.findAll);
app.post("/create", admins.createAdmin);
app.post("/login", admins.login);

app.post("/block-account", admins.blockAccount)
app.post("/unblock-account", admins.upBlockAccount)

module.exports = app;
