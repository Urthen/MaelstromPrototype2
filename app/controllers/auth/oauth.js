var url = require('url'),
	validator = require('validator'),
	mongoose = require('mongoose'),
	AppAuthorization = mongoose.model("AppAuthorization"),
	Application = mongoose.model("Application"),
	User = mongoose.model("User"),
	tokenService = require("../../services/tokens");

exports.login = function oauthLogin (req, res) {
	var callback = req.query.redirect_uri || req.application.redirect;

	var opts = {
		user: req.user,
		application: req.application,
		callback: validator.sanitize(req.query.redirect_uri).xss(),
		redirect: encodeURIComponent('/auth/oauth/authorize?client_id=' + validator.sanitize(req.query.client_id).xss() + "&redirect_uri=" + encodeURIComponent(validator.sanitize(req.query.redirect_uri).xss())),
	};

	res.render('auth/authorize', opts);
};

exports.confirm = function oauthConfirm(req, res) {
	req.user.addAppAuth(req.application)(function (permission){
		return permission.getAuthCode();		
	})(function (code) {		
		var orig_url = url.parse(req.body.redirect_uri, true);
		orig_url.query['code'] = code;
		res.redirect(url.format(orig_url));
	}).end();
};

exports.exchange = function oauthExchange(req, res) {
	tokenService.exchangeAuthCode(req.body.code, req.body.client_secret)(function(token){
		res.send(JSON.stringify({
			access_token: token
		}));
	}, function(err){
		res.send(400, JSON.stringify({
			error: String(err)
		}));
	}).end();
};
