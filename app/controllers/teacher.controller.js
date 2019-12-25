const ObjectId = require('mongodb').ObjectID;
const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const Tag = require('../models/tag.model');
const City = require('../models/city.model');
const District = require('../models/district.model');
const Contract = require('../models/contract.model');
const ContractTypes = require('../enums/EContractTypes.js');
const moment = require('moment');

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

exports.getStatisticalData = async (req, res) => {
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

  const data = await Contract.aggregate([
    {
      $match: {
        $and: [
          { status: ContractTypes.IS_COMPLETED_BY_ADMIN },
          { isPaid: true },
          { teacherId: { $ne: null } }
        ]
      }
    },
    {
      $group: {
        _id: {
          teacherId: '$teacherId',
          endDate: { $dateToString: { format: '%Y-%m-%d', date: '$endDate' } }
        },
        salary: { $sum: { $multiply: ['$costPerHour', '$workingHour'] } }
      }
    },
    {
      $group: {
        _id: '$_id.teacherId',
        endDates: {
          $push: {
            endDate: '$_id.endDate',
            salary: '$salary'
          }
        }
      }
    }
  ]);

  var payload = [];
  if (type === 'date') {
    data.forEach(element => {
      element.endDates.forEach(item => {
        const endDate = moment(item.endDate, 'YYYY-MM-DD').toDate();
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);
        const date = new Date(parseInt(dateInMiliseconds));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        if (date.valueOf() === endDate.valueOf()) {
          payload.push({
            userId: element._id.toString(),
            salary: parseFloat(item.salary.toString())
          });
        }
      });
    });
  }
  if (type === 'week') {
    const week = parseInt(weekObj.week);
    const year = parseInt(weekObj.year);
    data.forEach(element => {
      element.endDates.forEach(item => {
        const endDate = moment(item.endDate, 'YYYY-MM-DD').toDate();
        if (week === endDate.getWeek() && year === endDate.getFullYear()) {
          const index = payload.findIndex(
            e => e.userId === element._id.toString()
          );
          if (index > -1) {
            payload[index].salary += parseFloat(item.salary.toString());
          } else {
            payload.push({
              userId: element._id.toString(),
              salary: parseFloat(item.salary.toString())
            });
          }
        }
      });
    });
  }
  if (type === 'month') {
    const month = parseInt(monthObj.month);
    const year = parseInt(monthObj.year);
    data.forEach(element => {
      element.endDates.forEach(item => {
        const endDate = moment(item.endDate, 'YYYY-MM-DD').toDate();
        if (month === endDate.getMonth() && year === endDate.getFullYear()) {
          const index = payload.findIndex(
            e => e.userId === element._id.toString()
          );
          if (index > -1) {
            payload[index].salary += parseFloat(item.salary.toString());
          } else {
            payload.push({
              userId: element._id.toString(),
              salary: parseFloat(item.salary.toString())
            });
          }
        }
      });
    });
  }
  if (type === 'quarter') {
    const quarter = parseInt(quarterObj.quarter);
    const year = parseInt(quarterObj.year);
    data.forEach(element => {
      element.endDates.forEach(item => {
        const endDate = moment(item.endDate, 'YYYY-MM-DD').toDate();
        if (
          quarter === getQuarter(endDate.getMonth()) &&
          year === endDate.getFullYear()
        ) {
          const index = payload.findIndex(
            e => e.userId === element._id.toString()
          );
          if (index > -1) {
            payload[index].salary += parseFloat(item.salary.toString());
          } else {
            payload.push({
              userId: element._id.toString(),
              salary: parseFloat(item.salary.toString())
            });
          }
        }
      });
    });
  }
  if (type === 'all') {
    data.forEach(element => {
      element.endDates.forEach(item => {
        const index = payload.findIndex(
          e => e.userId === element._id.toString()
        );
        if (index > -1) {
          payload[index].salary += parseFloat(item.salary.toString());
        } else {
          payload.push({
            userId: element._id.toString(),
            salary: parseFloat(item.salary.toString())
          });
        }
      });
    });
  }

  payload = payload.sort((a, b) => b.salary - a.salary).slice(0, 10);

  for (item of payload) {
    var teacherObj = {};
    const userId = item.userId;
    const user = await User.findById({ _id: ObjectId(userId) })
      .populate('city')
      .populate('district');
    if (user) {
      const teacher = await Teacher.findOne({ userId: ObjectId(userId) });
      if (teacher) {
        // get user
        const {
          email,
          phone,
          birthdate,
          displayName,
          avatar,
          city,
          district
        } = user;

        // get teacher
        const {
          _id,
          salary,
          successRate,
          ratings,
          tags,
          jobs,
          hoursWorked
        } = teacher;

        // get tag
        const tagList = [];
        for (tag of tags) {
          const tagData = await Tag.findById({
            _id: ObjectId(tag._id)
          }).populate('majorId');
          tagList.push(tagData);
        }

        teacherObj = {
          email,
          phone,
          birthdate,
          displayName,
          avatar,
          city,
          district,
          teacherId: _id,
          salary: salary.toString(),
          successRate,
          ratings,
          jobs,
          hoursWorked,
          _id: userId
        };

        var index = payload.findIndex(item => item.userId === userId);
        if (index > -1) {
          payload[index].teacher = teacherObj;
        }
      } else {
        res.status(400).send({
          message: `Không tồn tại giáo viên với userId = ${userId}`
        });
        return;
      }
    } else {
      res.status(400).send({
        message: `Không tồn tại người dùng với id = ${userId}`
      });
      return;
    }
  }

  res.status(200).send({
    payload
  });
};
