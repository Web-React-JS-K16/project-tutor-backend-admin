const express = require('express');
const app = express();
const teachers = require('../controllers/teacher.controller');

app.get('/:limit/:offset', teachers.findAll);
app.get('/statistics', teachers.getStatisticalData);
module.exports = app;
