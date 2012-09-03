var mongoose = require('mongoose'),
	deferred = require('deferred'),
	User = mongoose.model("User");

exports.getInfo = function info(req, res) {
	deferred(User.pFindById(req.authorization.user), req.authorization.isAdminUser())(function(result){
		var identity = {
				user: req.authorization.getExternalUID(),
				name: result[0].name,
				admin: result[1]
			};
		res.send(JSON.stringify(identity));
	}).end();
};
