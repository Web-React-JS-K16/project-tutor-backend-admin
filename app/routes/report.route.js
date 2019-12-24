const express = require("express");
const app = express();
const reports = require("../controllers/report.controller");

app.get('/:limit/:offset', reports.findAll)
app.get('/:_id', reports.getDetail)

module.exports = app;
