var Sequelize = require("sequelize");


module.exports = new (function() {
  var callider_db = this.callider_db = new Sequelize('callider', 'nopass', null, {
    define: {
      // Disable plural
      freezeTableName: true,
      timestamps: false      
    }
  });
  var db = this.db = new Sequelize('node-schedule', 'nopass', null, {});

  var Graph = this.Graph = callider_db.define('graph_graph', {
      date: Sequelize.DATE,
      time: Sequelize.STRING,
      registration: Sequelize.STRING,
      wish_time: Sequelize.STRING,
      user_id: Sequelize.INTEGER
    });

  var prognosisDefenition = {
    fact: Sequelize.INTEGER,
    date: Sequelize.DATE
  };
  for (var i = 0; i < 24; i++) {
    var hour = i < 10 ? '0' + i : '' + i;
    prognosisDefenition["oper"+hour] = Sequelize.INTEGER;
  };

  var Prognosis = this.Prognosis = new Sequelize('prog_prognosis', prognosisDefenition)

  var CUser = this.CUser = callider_db.define('core_user', {
      login: Sequelize.STRING,    
    }, {
      // Disable plural
      freezeTableName: true,
      timestamps: false
  });

  var Load = this.Load = db.define('load', {
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    operators: Sequelize.INTEGER,
    isForecast: Sequelize.INTEGER,
    loadTypeId: Sequelize.INTEGER
  })

  var LoadType = this.LoadType = db.define('loadType', {
    name: Sequelize.STRING
  })

  var User = this.User = db.define('user', {
    login: {type: Sequelize.STRING, allowNull: false, unique: true},
  });

  var Shift = this.Shift = db.define('shift', {
    start: {type: Sequelize.DATE, allowNull: false},
    end: {type: Sequelize.DATE, allowNull: false}
  });

  var Schedule = this.Schedule = db.define('schedule', {
    name: {type: Sequelize.STRING, allowNull: false}
  });

  Shift.belongsTo(User, {as: 'user', allowNull: false});
  Shift.belongsTo(Schedule, {as: 'schedule', allowNull: false});
  Schedule.hasMany(Shift, {as: "Shifts"});

  
})




// exports.db = db;
// exports.callider_db = callider_db;
// exports.Shift = Shift;
// exports.User = User;
// exports.Schedule = Schedule;
// exports.Graph = Graph;