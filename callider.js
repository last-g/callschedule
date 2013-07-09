var _ = require("lodash"),
  util = require("util"),
  Sequelize = require("sequelize"),
  Chainer = Sequelize.Utils.QueryChainer,
  Promise = Sequelize.Promise,
//  Q = require("Q"),
  models = require("./models");

var db = models.db,
    callider_db = models.callider_db,
    Schedule = models.Schedule,
    Shift = models.Shift,
    User = models.User,
    Graph = models.Graph,
    CUser = models.CUser;


function getPortionalData(schedules, limit, offset) {
  return Graph.findAll({attributes: _.keys(Graph.rawAttributes), offset: offset, limit: limit, order: "id"}, {raw: true});
}

function makeSchedSync(shed) {
  var schedules = shed;
  function write(graph_items) {
    var objs = [];
    _.forEach(graph_items, function (val, key) {
      function mkDate(day, time) {
        if (!(day && time)) {
          return null;
        }
        var timeParts = time.split("-");
        var start = new Date(day);
        var end = new Date(day);

        start.setHours.apply(start, timeParts[0].split(':'));
        end.setHours.apply(end, timeParts[1].split(':'));

        if (end.getTime() < start.getTime()) {
          end.setDate(end.getDate() + 1); // Shift realy ends on the next day
        }
        return {
          start: start,
          end: end
        };
      }
      function mkShift(sched, shift_) {
        var shift = _.clone(shift_);
        shift.userId = shift.user_id;
        shift.Schedule = sched;
        shift.scheduleId = sched.id;

        return shift;
      }

      console.log("Making: " + val.id);

      var graph_sched = schedules[0];
      var wish_sched = schedules[1];
      var reg_sched = schedules[2];

      var graph_shift = mkDate(val.date, val.time);
      var wish_shift = mkDate(val.date, val.wish_time);
      var reg_shift = mkDate(val.date, val.registration);
      if (graph_shift) {
        objs.push(mkShift(graph_sched, graph_shift));
      }
      if (wish_shift) {
        objs.push(mkShift(wish_sched, wish_shift));
      }
      if (reg_shift) {
        objs.push(mkShift(reg_sched, reg_shift));
      }
    });
    return Shift.bulkCreate(objs);
  }

  var block = 1000;
  return Graph.count().then(function (total) {
    console.log(total);
    var i = 0;
    var adder = getPortionalData(shed, block, 0).then(write);
    for (i = block; i < total - 1; i += block) {
      adder.then(_.partial(getPortionalData, shed, block, i))
          .then(write);
    }
    return adder;
  });
}



var syncUsers = exports.syncUsers = function(callider_db, db) {
  return CUser.findAll()
    .then(function (users) {
      util.log("Got users");
      var adder = new Chainer();
      _.each(users, function (user) {
        adder.add(User.create({id: user.id, login: user.login}));
      })

      return adder.run();
    })
}

var syncSchedule = exports.syncSchedule = function (callider_db, db) {
  return new Chainer().add(Schedule.create({name: "main"}))
    .add(Schedule.create({name: "wishes"}))
    .add(Schedule.create({name: "registration"}))
    .run()
    .then(makeSchedSync);  
}