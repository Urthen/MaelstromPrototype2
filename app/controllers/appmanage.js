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
			for (var i = 0; i < permission.permissions.length; i++) {
				permission.permissions[0].remove();
			}
			return permission.pSave();
		} else {
			console.log("App auth id not found:", req.params.authid);
			return permission;
		}
	}).end(function() {
		res.redirect('/apps');
	}, function(err) {
		console.log("Error saving:", err);
		res.redirect('/apps');
	});
};

module.exports.revokeAppPermission = function (req, res) {
	return AppAuthorization.pFindById(req.params.authid)(function (permission) {
		if (permission) {
			var subpermission = permission.permissions.id(req.params.permissionid);
			if (subpermission) {
				subpermission.remove();
				return permission.pSave();
			} else {
				console.log("Subpermission id", req.params.permissionid, "not found for appauth id", req.params.authid);
				return permission;
			}
		} else {
			console.log("App auth id not found:", req.params.authid);
		}
	}).end(function () {
		res.redirect('/apps');
	});
};
