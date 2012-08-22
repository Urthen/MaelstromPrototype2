var mongoose = require('mongoose'),
	Application = mongoose.model('Application');

exports.requireLogin = function (req, res, next) {
	if (!req.user) {
		res.redirect("/login");
		return;
	} else if (req.user.temporary) {
		res.redirect('/newuser');
		return;
	}
	next();
};

exports.getApp = function (req, res, next) {
	if (!req.params.id) {
		console.log("Application ID required but not specified.");
		res.redirect("/404");
		return;
	}
	Application.pFindById(req.params.id)(function(app){
		if (app) {
			req.application = app;
			next();
		} else {
			console.log("Application ID " + req.params.id + " not found.");
			res.redirect("/404");
		}
	}, function(err) {
		console.log("Error retrieving application ID:", req.params.id);
		res.redirect("/404");
	}).end();
};
