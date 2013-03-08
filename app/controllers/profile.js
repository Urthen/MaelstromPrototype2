var emailverify = require('./emailverify'),
	deferred = require('deferred'),
	validator = require('validator'),
	fs = require('fs'),
	awsservice = require('../services/awsservice');

exports.showProfile = function(req, res) {
	res.render('profile/profile');
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
			return req.user.pSave();
		})(function() {
			res.redirect('/profile/edit');
		}, function(err) {
			console.log("error saving user:", err);
			res.redirect('/profile/edit');
		});

	} else {
		res.render('profile/edit');
	}
};

exports.editProfilePic = function(req, res) {
	if (req.route.method === 'post') {
		var buf = fs.readFileSync(req.files.profilePic.path);

		awsservice.uploadFile(buf, "profilepics/" + req.user.id + "_pic", "image/jpeg", function(err, data) {
			if (err == null) {
				if (req.user.hasPic == false) {
					req.user.hasPic = true;
					req.user.pSave()(function() {
						res.redirect('/profile/edit');
					}, function(err) {
						console.log("error saving user:", err);
						res.redirect('/profile/edit');
					}); 
				} else {
					res.redirect('/profile/edit');
				}
			} else {
				req.session.messages.errors = ["Error saving profile picture."];
				console.log("error saving profile pic:", err);
				res.render('profile/editpic');
			}
		});
		
	} else {
		res.render('profile/editpic');
	}
};

exports.getProfilePic = function(req, res) {
	awsservice.getFile("profilepics/" + req.user.id + "_pic", function(err, data) {
		if (err == null) {
			res.setHeader('Content-Type', data["Headers"]["content-type"]);
			res.send(data["Body"]);
		} else {
			console.log("error retrieving profile pic:", err);
			res.send("");
		}
	});
};

exports.linkedProfiles = function(req, res) {
	res.render('profile/linked');
};
