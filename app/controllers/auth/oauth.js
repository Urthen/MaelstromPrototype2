var url = require('url'),
	validator = require('validator'),
	mongoose = require('mongoose'),
	AppAuthorization = mongoose.model("AppAuthorization"),
	Application = mongoose.model("Application"),
	User = mongoose.model("User");

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
	req.user.addAppAuth(req.application)(function(permission){
		var orig_url = url.parse(req.body.redirect_uri, true);

		orig_url.query['code'] = permission.getAuthCode();

		res.redirect(url.format(orig_url));
	}).end();
};
