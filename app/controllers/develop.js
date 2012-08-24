var validator = require('validator'),
	mongoose = require('mongoose'),
	Application = mongoose.model("Application");

exports.landingPage = function(req, res) {
	
	Application.pFind({creator: req.user.id})(function(apps){
		res.render('dev_landing', {apps: apps});		
	}, function (err) {
		console.log("Error retrieving applications:", err);
		res.render('dev_landing', {apps: []});
	})
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
		redirect: redirect,
		creator: req.user	
	});
	app.regenerateSecret();
	app.pSave()(function(){
		res.redirect('/dev/app/edit/' + app.id);
	}, function(err) {
		console.log("Error creating new app:", err);
		errors.push("Unexpected error creating new application. If this continues to happen, please contact support.");
		res.render('dev_createapp', {messages: {errors: errors}, prepop: {name: name, domain: domain, redirect: redirect}});
	});
};

exports.editAppPage = function (req, res) {
	// Make sure both are strings...
	if('' + req.user.id !== '' + req.application.creator) {
		res.redirect('/404');
	}
	if(req.route.method === 'get') {
		res.render('dev_editapp', {app: req.application});
	} else {

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
			res.render('dev_editapp', {messages: {errors: errors}, app: req.application});
			return;		
		}

		req.application.name = name;
		req.application.domain = domain;
		req.application.redirect = redirect;
		req.application.pSave()(function(){
			res.render('dev_editapp', {app: req.application});
		}, function(err) {
			console.log("Error editing app:", err);
			errors.push("Unexpected error creating new application. If this continues to happen, please contact support.");
			res.render('dev_createapp', {messages: {errors: errors}, app: req.application});
		});
	}
};

exports.regenKey = function(req, res) {
	req.application.regenerateSecret();
	req.application.save(function(err){
		if (err) { req.session.messages.errors = ["Unexpected error regenerating secret."]; }
		res.redirect('/dev/app/edit/' + req.application.id);
	});
};
