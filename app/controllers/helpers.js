var mongoose = require('mongoose'),
	Application = mongoose.model('Application'),
	tokenService = require('../services/tokens');

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
	var appid = req.param('appid') || req.param('client_id');
	if (!appid) {
		console.log("Application ID required but not specified.");
		res.redirect("/404");
		return;
	}
	Application.pFindById(appid)(function(app){
		if (app) {
			req.application = app;
			next();
		} else {
			console.log("Application ID " + appid + " not found.");
			res.redirect("/404");
		}
	}, function(err) {
		console.log("Error retrieving application ID:", appid);
		res.redirect("/404");
	}).end();
};

exports.getAuthorization = function (req, res, next) {
	var authToken = req.param('access_token');
	if (!authToken) {
		res.send(401, JSON.stringify({
			error: "Access token invalid or not specified"
		}));
		return;
	}

	tokenService.getAuthFromToken(authToken)(function(auth){
		req.authorization = auth;
		next();
	}, function(err) {
		res.send(401, JSON.stringify({
			error: String(err)
		}));
	}).end();
};
