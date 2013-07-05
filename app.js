var _ = require("lodash")
    , util = require("util")
	, Sequelize = require("sequelize");


var db = new Sequelize('node-schedule', 'nopass', null, {
});

var User = db.define('user', {
  login: {type: Sequelize.STRING, allowNull: false, unique: true},
  name: Sequelize.STRING,
  surname: Sequelize.STRING
});

var Shift = db.define('shift', {
	start: {type: Sequelize.DATE, allowNull: false},
	end: {type: Sequelize.DATE, allowNull: false},
    employee: {type: User, allowNull:false}
});
Shift.belongsTo(User)

var Schedule = db.define('schedule', {
   name: {type: Sequelize.STRING, allowNull:false}
});

Schedule.hasMany(Shift);



db.sync().success(function () {
	console.log("Created successfully");
}).error(function (error) {
	console.log("Something bad occurs");
	util.log(util.inspect(error));
});



var alice = User.build({login:"alice", name:"Alice", surname: "Silverstone"});
var bob = User.build({login:"bob", name:"Bob", surname: "Marley"});

// _.forEach(alice, function (val, key) {
// 	console.log(key);
// })

console.log("Hello, kitty!")