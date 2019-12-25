const ObjectId = require('mongodb').ObjectID;
const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const City = require('../models/city.model');
const District = require('../models/district.model');
const Contract = require('../models/contract.model');
const ContractTypes = require('../enums/EContractTypes.js');

//Get all teacher
exports.findAll = async (req, res) => {
  try {
    let { limit, offset } = req.params;

    limit = parseInt(limit);
    offset = parseInt(offset);

    const length = await Teacher.find().countDocuments();

    const data = await Teacher.find()
      .limit(limit)
      .skip((offset - 1) * limit)
      .populate({
        path: 'userId',
        // match: { isBlock: false },
        select: ['-password', '-passwordHash']
      })
      .populate('tags._id');

    //Get account with isBlock === false

    // const users = data.filter((user) => user.userId !== null)
    // if (users.length === 0) {
    //   return res.status(400).json({ message: "Không tồn tại giáo viên trong database." });
    // }
    // return res.status(200).json({ users: users })

    if (data.length > 0) {
      return res.status(200).json({ data, length });
    } else {
      return res.status(400).json({ message: 'Không tìm thấy dữ liệu.' });
    }
  } catch (err) {
    console.log('err: ', err);
    return res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  var dayOfYear = (today - onejan + 86400000) / 86400000;
  return Math.ceil((dayOfYear + onejan.getDay()) / 7);
};

function getQuarter(month) {
  const firstQuarter = [0, 1, 2];
  const secondQuarter = [3, 4, 5];
  const thirdQuarter = [6, 7, 8];
  const fourthQuarter = [9, 10, 11];
  if (firstQuarter.indexOf(month) > -1) {
    return 1;
  }
  if (secondQuarter.indexOf(month) > -1) {
    return 2;
  }
  if (thirdQuarter.indexOf(month) > -1) {
    return 3;
  }
  if (fourthQuarter.indexOf(month) > -1) {
    return 4;
  }
}

exports.getStatisticalData = (req, res) => {
  var type = req.query.type || 'date';
  var dateInMiliseconds = req.query.date || Date.now();
  var monthObj = req.query.monthObj || {
    month: 0,
    year: 2019
  };
  var weekObj = req.query.weekObj || {
    week: 1,
    year: 2019
  };
  var quarterObj = req.query.quarterObj || {
    quarter: 1,
    year: 2019
  };

  // build query
  var query = {};
  query['status'] = ContractTypes.IS_COMPLETED_BY_ADMIN;
  if (type === 'date') {
    const oneDayInMiliSeconds = 86400000;
    const date = new Date(parseInt(dateInMiliseconds));
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const nextDate = new Date(date.valueOf() + oneDayInMiliSeconds);
    nextDate.setHours(0);
    nextDate.setMinutes(0);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    query['endDate'] = { $gte: date, $lt: nextDate };
  } else if (type === 'month') {
    const month = parseInt(monthObj.month);
    const year = parseInt(monthObj.year);
    query['endDate'] = {
      $gte: new Date(year, month, 1),
      $lt: new Date(year, month + 1, 1)
    };
  }

  Contract.find(query)
    .then(async contracts => {
      var data = [];

      contracts.sort(function(a, b) {
        const aSalary =
          parseInt(a.workingHour) * parseFloat(a.costPerHour.toString());
        const bSalary =
          parseInt(b.workingHour) * parseFloat(b.costPerHour.toString());
        return bSalary - aSalary;
      });

      for (contract of contracts) {
        // get contract
        const { endDate, costPerHour, workingHour, teacherId } = contract;
        const formattedEndDate = new Date(endDate);

        const user = await User.findById({ _id: ObjectId(teacherId) })
          .populate('city')
          .populate('district');
        var teacherObj = {};
        if (user) {
          // get user
          const { displayName, avatar, city, district } = user;
          const teacher = await Teacher.findOne({ userId: ObjectId(user._id) });
          if (teacher) {
            // get teacher
            const {
              _id,
              salary,
              successRate,
              ratings,
              jobs,
              hoursWorked,
              userId
            } = teacher;

            teacherObj = {
              displayName,
              avatar,
              teacherId: _id,
              city,
              district,
              salary: salary.toString(),
              successRate,
              ratings,
              jobs,
              hoursWorked,
              _id: teacherId
            };
          } else {
            res.status(400).send({
              message: `Không tồn tại giáo viên với userId = ${user._id}`
            });
            return;
          }
        } else {
          res.status(400).send({
            message: `Không tồn tại người dùng với id = ${teacherId}`
          });
          return;
        }

        if (data.length === 10) {
          break;
        }
        if (type === 'week') {
          const week = parseInt(weekObj.week);
          const year = parseInt(weekObj.year);
          if (
            week === formattedEndDate.getWeek() &&
            year === formattedEndDate.getFullYear()
          ) {
            data.push({
              teacher: teacherObj,
              salary:
                parseInt(workingHour) *
                parseFloat(costPerHour.toString()) *
                1000
            });
          }
        } else if (type === 'quarter') {
          const quarter = parseInt(quarterObj.quarter);
          const year = parseInt(quarterObj.year);
          if (
            quarter === getQuarter(formattedEndDate.getMonth()) &&
            year === formattedEndDate.getFullYear()
          ) {
            data.push({
              teacher: teacherObj,
              salary:
                parseInt(workingHour) *
                parseFloat(costPerHour.toString()) *
                1000
            });
          }
        } else if (type === 'all' || type == 'date' || type == 'month') {
          data.push({
            teacher: teacherObj,
            salary:
              parseInt(workingHour) * parseFloat(costPerHour.toString()) * 1000
          });
        }
      }
      console.log(data);
      res.status(200).send({
        payload: data
      });
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(500).send({
        message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
      });
    });
};
