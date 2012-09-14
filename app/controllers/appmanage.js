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
				def.resolve(application);
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
	AppAuthorization.pFindById(req.params.authid)(function (permission) {
		if (permission) {
			permission.valid = false;
			for (var i = 0; i <= permission.permissions.length; i++) {
				permission.permissions[0].remove();
			}
			permission.pSave().end(function(err) {
				if (err) {
					console.log("error saving after revoking permission:", err);
				}
				res.redirect('/apps');
			});
		} else {
			res.redirect('/apps');
		}
	});
};
