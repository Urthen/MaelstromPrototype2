var mongoose = require('mongoose'),
	User = mongoose.model("User");

exports.getInfo = function info(req, res) {
	User.pFindById(req.authorization.user)(function(user){
		var identity = {
				user: req.authorization.getExternalUID(),
				name: user.name
			};
		res.send(JSON.stringify(identity));
	}).end();
};
