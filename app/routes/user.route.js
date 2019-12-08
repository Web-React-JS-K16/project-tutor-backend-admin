const express = require("express");
const app = express();
const users = require("../controllers/user.controller");

app.get("/info", users.getInforUser)

module.exports = app;
