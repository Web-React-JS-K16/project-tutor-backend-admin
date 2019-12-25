exports.getNumberOfWeek = date => {
  const today = new Date(date);
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  return Math.floor((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

exports.project = {
  $project: {
    endDate: { $dateToString: { format: '%Y-%m-%d', date: '$endDate' } },
    year: { $year: '$endDate' },
    week: { $week: '$endDate' },
    status: '$status',
    isPaid: '$isPaid',
    costPerHour: '$costPerHour',
    workingHour: '$workingHour',
    tags: '$tags'
  }
};

exports.group = {
  $group: {
    _id: '$tags._id',
    total: { $sum: { $multiply: ['$costPerHour', '$workingHour'] } },
    count: { $sum: 1 }
  }
};

exports.lookup = {
  $lookup: {
    from: 'tags',
    localField: '_id',
    foreignField: '_id',
    as: 'tags'
  }
};

exports.sort = {
  $sort: { _id: 1 }
};

exports.matchResult = {
  $match: { count: { $gt: 0 }, _id: { $ne: [] } }
};

exports.handleData = ({ data }) => {
  let newData = [];
  data.map(item => {
    item.tags.map(tag => {
      let _tag = {
        _id: tag._id,
        name: tag.name,
        cost: item.total
      };
      _tag.cost = parseFloat(_tag.cost);
      if (newData.some(el => el._id.toString() === _tag._id.toString())) {
        const index = newData.findIndex(
          x => x._id.toString() === _tag._id.toString()
        );
        _tag.cost = newData[index].cost + _tag.cost;
      }

      newData.push(_tag);
    });
  });

  newData = newData.sort((a, b) => b.cost - a.cost).slice(0, 10);
  return newData;
};

exports.aggregate = (fromNewDate, endNewDate) => [
  {
    $match: {
      $and: [
        {
          endDate: {
            $gte: new Date(fromNewDate),
            $lte: new Date(endNewDate)
          }
        },
        { status: 5 },
        { isPaid: true }
      ]
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$endDate' } },
      total: { $sum: { $multiply: ['$costPerHour', '$workingHour'] } },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  },
  {
    $match: { count: { $gt: 0 } }
  }
];
