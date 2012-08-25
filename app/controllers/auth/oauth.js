var url = require('url'),
	validator = require('validator'),
	crypto = require('crypto'),
	mongoose = require('mongoose'),
	//AppAuthorization = mongoose.model("AppAuthorization"),
	Application = mongoose.model("Application"),
	User = mongoose.model("User");

exports.login = function oauthLogin (req, res) {
	var opts = {
		user: req.user,
		application: req.application,
		callback: validator.sanitize(req.query.redirect_uri).xss(),
		redirect: encodeURIComponent('/auth/oauth/authorize?client_id=' + validator.sanitize(req.query.client_id).xss() + "&redirect_uri=" + encodeURIComponent(validator.sanitize(req.query.redirect_uri).xss())),
	};

	res.render('auth/authorize', opts);
};