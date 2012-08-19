var mailer = require('../mailer'),
	crypto = require('crypto');

function genEmailVerifyKey(email, user) {
	shasum = crypto.createHash('sha1');
	shasum.update("" + email.id);
	shasum.update("" + user.id);
	return shasum.digest('hex');
}

exports.sendVerification = function sendVerification(req, res) {
	var eid = req.params.id,
		email,
		shasum;

	if (!eid) {
		console.log("email id missing from verification")
		res.render('email_verify', {
			error: true,
			completed: false
		})
		return;
	}

	email = req.user.emails.id(eid);
	if (!email) {
		console.log("email id doesn't match any of users' emails");
		res.render('email_verify', {
			error: true,
			completed: false
		})
		return;
	} else if (email.verified) {
		res.render('email_verify', {
			error: true,
			completed: true,
			email: email.email
		})
	}

	mailer.sendTemplate("email_verify", {
			from: "Project Maelstrom <welcome@projectmaelstrom.com>",
			to: email.email,
			subject: "Verify your email",
		}, {
			returnUrl: "http://prototype.projectmaelstrom.com/email/verify/" + email.id + "?key=" + genEmailVerifyKey(email, req.user)
		})(function() {
			res.render('email_verify', {
				error: false,
				completed: false,
				email: email.email
			})
		});
}

exports.sendWelcome = function sendWelcome(email, user) {
	return mailer.sendTemplate("welcome", {
			from: "Project Maelstrom <welcome@projectmaelstrom.com>",
			to: email.email,
			subject: "Welcome to Maelstrom",
		}, {
			returnUrl: "http://prototype.projectmaelstrom.com/email/verify/" + email.id + "?key=" + genEmailVerifyKey(email, user)
		});
}

exports.verifyEmail = function verifyEmail(req, res) {
	var eid = req.params.id,
		email,
		shasum;

	if (!eid) {
		console.log("email id missing from verification")
		res.render('email_verify', {
			error: true,
			completed: false
		})
		return;
	}

	email = req.user.emails.id(eid);
	if (!email) {
		console.log("email id doesn't match any of users' emails");
		res.render('email_verify', {
			error: true,
			completed: false
		})
		return;
	} else if (req.query.key !== genEmailVerifyKey(email, req.user)) {
		console.log("email key isn't correct for given email");
		res.render('email_verify', {
			error: true,
			completed: false
		})
		return;
	} else {
		email.verified = Date.now();
		req.user.save();
		res.render('email_verify', {
			error: false,
			completed: true,
			email: email.email
		});
	}
}