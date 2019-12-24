const express = require("express");
const app = express();
const contracts = require("../controllers/contract.controller");

app.get('/statictis-by-date/:fromDate/:endDate', contracts.StatictisByDate)
app.get('/statictis-by-month/:fromDate/:endDate', contracts.StatictisByMonth)
app.get('/statictis-by-week/:fromDate/:endDate', contracts.StatictisByWeek)
app.get('/statictis-by-year/:fromYear/:endYear', contracts.StatictisByYear)
app.get('/:limit/:offset', contracts.findAll)
app.get('/:_id', contracts.getDetail)
app.post('/change-status',contracts.changeStatus)
module.exports = app;
