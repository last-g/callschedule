var _ = require("lodash")
    , util = require("util")
	, Sequelize = require("sequelize")
	, Chainer = Sequelize.Utils.QueryChainer;

var db = new Sequelize('node-schedule', 'nopass', null, {
});

var callider_db = new Sequelize('callider', 'nopass', null);

var Graph = callider_db.define('graph_graph', {
	id : Sequelize.INTEGER,
	date: Sequelize.DATE,
	time: Sequelize.STRING,
	registration: Sequelize.STRING,
	wish_time: Sequelize.STRING,

	user_id: Sequelize.INTEGER
}, {
	// Disable plural
	freezeTableName: true,
	timestamps: false
})


var User = db.define('user', {
  login: {type: Sequelize.STRING, allowNull: false, unique: true},
  name: Sequelize.STRING,
  surname: Sequelize.STRING
});

var Shift = db.define('shift', {
	start: {type: Sequelize.DATE, allowNull: false},
	end: {type: Sequelize.DATE, allowNull: false},
//    employee: {type: User, allowNull:false}
});

var Schedule = db.define('schedule', {
   name: {type: Sequelize.STRING, allowNull:false}
});


Shift.belongsTo(User, {as: 'user', allowNull: false});
Shift.belongsTo(Schedule, {as: 'schedule', allowNull: false});
Schedule.hasMany(Shift, {as: "Shifts"} );



db.sync({force:true}).success(function () {
	console.log("Created successfully");
	var alice = User.build({login:"alice", name:"Alice", surname: "Silverstone"});
	var bob = User.build({login:"bob", name:"Bob", surname: "Marley"});

	// alice.save().then(bob.save).error(function (error) {
	// 	console.log("Hay " + error)
	// })

	new Chainer().add( alice.save())
		.add(bob.save())
		.run()
		.success(function (results) {
			util.log("Saved saved");
			util.log(util.inspect(results))
		}).error(function (error) {
			console.error("Can't save users");
			util.log(util.inspect(error));
		});
	new Chainer().add(Schedule.create({name: "main"}))
		.add(Schedule.create({name: "wishes"}))
		.add(Schedule.create({name: "registration"}))
		.run()
		.success(lalala)
		.error(function (err) {
				console.log("cant find in callider_db");
				console.log(util.inspect(err));
		}).error(function (err) {
			util.error("Fail to add Schedule:" + err);
		});
}).error(function (error) {
	console.log("Something bad occurs");
	util.log(util.inspect(error));
});


function lalala(shed)
{
	var schedules = shed;

	function write (graph_items) {
		var objs = [];
		_.forEach(graph_items, function (val, key) {
			function mkDate (day, time) {
				if(!(day && time))
					return null;
				var timeParts = time.split("-");
				var start = new Date(day);
				var end = new Date(day);

				start.setHours.apply(start, timeParts[0].split(':'));
				end.setHours.apply(end, timeParts[1].split(':'));

				if(end.getTime() < start.getTime())
					end.setDate(end.getDate()+1);

				return {
					start: start,
					end: end
				}
			};
			function mkShift (sched, shift_) {
				var shift = _.clone(shift_);
				shift.User = shift.user_id;
				shift.Schedule = sched;
				shift.scheduleId = sched.id;
//				shift.id = sched.id *1000000 + val.id
				
				return shift;

			}

			console.log("Making: " + val.id)
			
			var graph_sched = schedules[0];
			var wish_sched = schedules[1];
			var reg_sched = schedules[2];

			var graph_shift = mkDate(val.date, val.time);
			var wish_shift = mkDate(val.date, val.wish_time);
			var reg_shift = mkDate(val.date, val.registration);
			if(graph_shift)
				objs.push(mkShift(graph_sched, graph_shift));
			if(wish_shift)
				objs.push(mkShift(wish_sched, wish_shift));
			if(reg_shift)
				objs.push(mkShift(reg_sched,reg_shift));
		})
		return Shift.bulkCreate(objs);
	}

	var block = 1000;
	Graph.count().success(function(total) {
		console.log(total);
		var adder = get_portional_data(shed, block, 0).then(write);
		for(var i = block; i < total-1; i += block)
		{
			adder.then(_.partial(get_portional_data, shed, block, i))
				.then(write); 
		}
	})
}

function get_portional_data(schedules, limit, offset) {
	return Graph.findAll({attributes:_.keys(Graph.rawAttributes), offset: offset, limit: limit, order: "id"}, {raw:true})
}