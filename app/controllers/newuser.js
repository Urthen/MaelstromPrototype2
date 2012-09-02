var mongoose = require('mongoose'),
	emailverify = require('./emailverify'),
	mailer = require('../mailer'),
	validator = require('validator'),
	User = mongoose.model('User');

exports.newUser = function newUser (req, res) {
	// Can't use the requiresLogin helper as that would create a redirect loop, so put the logic here.
	if (!req.user) {
		res.redirect("/login");
		return;
	} else if (!req.user.temporary) {
		res.redirect("/");
		return;
	}

	res.render("newuser");
};

exports.newUserConfirm = function newUserConfirm (req, res, next) {
	if (!req.user) {
		res.redirect("/login");
		return;
	} else if (!req.user.temporary) {
		res.redirect("/");
		return;
	}

	var email = req.body.email;

	if (email) {
		try {
			validator.check(email).len(3, 100).isEmail();
			req.user.addEmail(email)(function (emailObj) {
				if (emailObj) {
					emailverify.sendWelcome(emailObj, req.user)(function(){
							req.user.temporary = false;
							return req.user.pSave();
						})(function() {
							next();
						}, function(err) {
							next(err);
						}).end();
				} else {
					res.render("newuser", {messages: {emailTaken: true, emailPrefill: email}});
				}
			}).end();
		} catch(e) {
			res.render("newuser", {messages: {emailInvalid: true, emailPrefill: email}});
		}
	} else {
		req.user.temporary = false;
		req.user.pSave()(function() {
			next();
		}, function(err) {
			next(err);
		}).end();
	}
};

exports.newUserDecline = function newUserDeclien (req, res) {
	if (!req.user) {
		res.redirect("/login");
		return;
	} else if (!req.user.temporary) {
		res.redirect("/");
		return;
	}

	req.user.remove();
	res.redirect("/login");
};