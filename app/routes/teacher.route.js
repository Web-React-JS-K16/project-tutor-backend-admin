const express = require("express");
const app = express();
const teachers = require("../controllers/teacher.controller");

app.get("/:limit/:offset", teachers.findAll)

module.exports = app;
