var validator = require('validator'),
	mongoose = require('mongoose'),
	Application = mongoose.model("Application");

exports.landingPage = function(req, res) {
	res.render('dev_landing');	
};

exports.createAppPage = function(req, res) {
	if(req.route.method === 'get') {
		res.render('dev_createapp', {prepop: {}});
		return;
	}
	var name = validator.sanitize(req.body.name).trim(),
		domain = validator.sanitize(req.body.domain).trim(),
		redirect = validator.sanitize(req.body.redirect).trim(),
		errors = [];

	try {
		validator.check(name).len(5,60);
	} catch(e) {
		errors.push('Application name must be between 5 and 60 characters.');
	}

	try {
		validator.check(domain).is(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/);
	} catch(e) {
		errors.push('Domain name must be in sub.domain.tld format.');
	}

	try {
		validator.check(redirect).isUrl().not(/^ftp/i);
	} catch(e) {
		errors.push('Redirect URL must be in valid http/https URL format.');
	}

	if(errors.length > 0) {
		res.render('dev_createapp', {messages: {errors: errors}, prepop: {name: name, domain: domain, redirect: redirect}});
		return;		
	}

	var app = new Application({
		name: name,
		domain: domain,
		url: redirect,
		creator: req.user	
	});
	app.regenerateSecret();
	app.save(function(){
		res.redirect('/dev/app/edit/' + app.id);
	}, function(err) {
		console.log("Error creating new app:", err);
		errors.push("Unexpected error creating new application. If this continues to happen, please contact support.");
		res.render('dev_createapp', {messages: {errors: errors}, prepop: {name: name, domain: domain, redirect: redirect}});
	});
};

exports.editAppPage = function (req, res) {
	if(req.user.id !== req.application.creator) {
		res.redirect('/404');
	}
	res.render('dev_editapp', {app: req.application});
};

exports.regenKey = function(req, res) {
	req.application.regenerateSecret();
	req.application.save(function(err){
		if (err) { req.session.messages.errors = ["Unexpected error regenerating secret."]; }
		res.redirect('/dev/app/edit/' + req.application.id);
	});
};
