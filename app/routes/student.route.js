const express = require("express");
const app = express();
const students = require("../controllers/student.controller");

app.get("/:limit/:offset", students.findAll)

module.exports = app;
