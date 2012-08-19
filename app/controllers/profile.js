var emailverify = require('./emailverify'),
	deferred = require('deferred'),
	validator = require('validator');

exports.showProfile = function(req, res) {
	res.render('profile');
};

function removeEmail(user, email) {
	var emailObj = user.emails.id(email);
	if (emailObj) {
		emailObj.remove();
	}
}

function addEmail(user, email) {
	var def = deferred();
	user.addEmail(email)(function (emailObj) {
		if(email) {
			emailverify.sendVerification(emailObj, user)(function(){	
				def.resolve();
			}, function(err) {
				if (err) {console.log(err);}
				def.resolve();
			}).end();
		} else {
			def.resolve();
		}
	});
	return def.promise;
}

exports.editProfile = function(req, res) {

	if (req.route.method === 'post') {
		var promises = [],
			initPromise = deferred(),
			i;

		initPromise.resolve();
		promises.push(initPromise.promise);

		req.user.name = req.body.preferredName;

		if (req.body.removeEmail) {
			if(req.body.removeEmail.substring) {
				removeEmail(req.user, req.body.removeEmail);
			} else {
				for(i in req.body.removeEmail) {
					removeEmail(req.user, req.body.removeEmail[i]);
				}
			}
		}

		var email;
		if (req.body.addEmail) {
			if(req.body.addEmail.substring) {
				email = req.body.addEmail;
				try {
					if (validator.check(email).len(3, 100).isEmail()) {				
						promises.push(addEmail(req.user, email));	
					}
				} catch(e) {}
			} else {
				for(i in req.body.addEmail) {
					email = req.body.addEmail;
					try {
						if (validator.check(email).len(3, 100).isEmail()) {				
							promises.push(addEmail(req.user, email));	
						}
					} catch(e) {}
				}
			}
		}

		deferred.apply(deferred, promises)(function() {	
			req.user.save(function(err) {
				res.redirect('/profile/edit');
			});
		});

	} else {
		res.render('profile_edit');
	}
};

exports.linkedProfiles = function(req, res) {
	res.render('profile_linked');
};
