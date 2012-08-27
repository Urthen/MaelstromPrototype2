var mongoose = require('mongoose'),
	util = require('util'),
	deferred = require('deferred'),
	AppAuthorization = mongoose.model("AppAuthorization"),
	Application = mongoose.model('Application');

module.exports.listApps = function (req, res) {	
	AppAuthorization.pFind({user: req.user.id, valid: true}).map(function (permission) {
		var def = deferred();
		Application.findById(permission.application, function(err, application){
			if(err) {
				throw err;
			} else {
				application.permission = permission;
				def.resolve(application)
			}
		});
		return def.promise;
	}).end(function (applications) {
		res.render('applist', {applications: applications});
	}, function(err) {
		throw err;
	});
};

module.exports.revokeApp = function (req, res) {
	AppAuthorization.findByIdAndUpdate(req.params.authid, {$set: {valid: false}}, function (err, permission) {
		res.redirect('/apps');
	})
}