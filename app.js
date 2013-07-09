var _ = require("lodash"),
  util = require("util"),
  Sequelize = require("sequelize"),
  Chainer = Sequelize.Utils.QueryChainer,
  models = require("./models");
  callider = require("./callider")

// Dirty hack



new Chainer()
  .add(models.db, 'sync', [{force: true}] )
  .add(models.callider_db, 'sync')
  .runSerially()
  .success( function () {
    callider.syncUsers(models.callider_db, models.db).then(function () {
      util.log("Users done");
    }, function (error) {
      util.log("Can't get users");
    })
    .then(function () {
      callider.syncSchedule(models.callider_db, models.db).success(function () {
        util.log("We got data synced");
      })
    }, function (error) {
      console.log("Something bad occurs");
      util.log(util.inspect(error));
    })
  })