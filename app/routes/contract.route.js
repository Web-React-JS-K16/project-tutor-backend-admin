const express = require("express");
const app = express();
const contracts = require("../controllers/contract.controller");

//----------------------------------
app.get('/statictis-by-date/:fromDate/:endDate', contracts.StatictisByDate)
app.get('/statictis-by-month/:fromDate/:endDate', contracts.StatictisByMonth)
app.get('/statictis-by-week/:fromDate/:endDate', contracts.StatictisByWeek)
app.get('/statictis-by-year/:fromYear/:endYear', contracts.StatictisByYear)

//----------------------------------
app.get('/statictis-skill-by-date/:endDate', contracts.StatictisSkillByDate)
app.get('/statictis-skill-by-week/:endDate', contracts.StatictisSkillByWeek)
app.get('/statictis-skill-by-month/:endDate', contracts.StatictisSkillByMonth)
app.get('/statictis-skill-by-three-month/:endDate', contracts.StatictisSkillByThreeMonth)

//----------------------------------
app.get('/:limit/:offset/:status/:startDate/:endDate', contracts.findAll)
app.get('/:_id', contracts.getDetail)

//----------------------------------
app.post('/change-status',contracts.changeStatus)
app.post('/change-status-complete',contracts.changeStatusComplete)

app.post('/test', contracts.test)
module.exports = app;
