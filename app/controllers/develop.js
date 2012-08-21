var validator = require('validator');

exports.landingPage = function(req, res) {
	res.render('dev_landing');	
};

exports.createAppPage = function(req, res) {
	if(req.route.method === 'get') {
		res.render('dev_createapp', {prepop: {}});
		return;
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
			res.render('dev_createapp', {messages: {errors: errors}, prepop: {name: name, domain: domain, redirect: redirect}});		
		} else {
			res.redirect('/dev');
		}
	}
};