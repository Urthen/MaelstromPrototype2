var mailer = require('../mailer'),
	crypto = require('crypto');

function genEmailVerifyKey(email, user) {
	var shasum = crypto.createHash('sha1');
	shasum.update("" + email.email);
	shasum.update("" + user.id);
	return shasum.digest('hex');
}

function sendVerification (email, user) {
	console.log("sendVerification", email);
	return mailer.sendTemplate("email_verify", {
			from: "Project Maelstrom <welcome@projectmaelstrom.com>",
			to: email.email,
			subject: "Verify your email",
		}, {
			returnUrl: "http://prototype.projectmaelstrom.com/email/verify/" + email.id + "?key=" + genEmailVerifyKey(email, user) + "&continue=/profile"
		});
}

exports.sendVerification = sendVerification;

exports.sendVerificationRoute = function sendVerificationRoute(req, res) {
	var eid = req.params.id,
		email;

	if (!eid) {
		console.log("email id missing from verification");
		res.render('profile/email_verify', {messages: {idError: true, back: '/profile'}});
		return;
	}

	email = req.user.emails.id(eid);
	if (!email) {
		console.log("email id doesn't match any of users' emails");
		res.render('profile/email_verify', {messages: {idError: true, back: '/profile'}});
		return;
	} else if (email.verified) {
		res.render('profile/email_verify', {messages: {alreadyVerified: true, email: email.email, continue: '/profile'}});
	}
	
	sendVerification(email, req.user)(function() {
			res.render('profile/email_verify', {messages: {sent: true, email: email.email, continue: '/profile'}});
		}).end();
};

exports.sendWelcome = function sendWelcome(email, user) {
	return mailer.sendTemplate("welcome", {
			from: "Project Maelstrom <welcome@projectmaelstrom.com>",
			to: email.email,
			subject: "Welcome to Maelstrom",
		}, {
			returnUrl: "http://prototype.projectmaelstrom.com/email/verify/" + email.id + "?key=" + genEmailVerifyKey(email, user) + "&continue=/"
		});
};

exports.verifyEmailRoute = function verifyEmailRoute(req, res) {
	var eid = req.params.id,
		email;

	if (!eid) {
		console.log("email id missing from verification");
		res.render('profile/email_verify', {messages: {idError: true, back: '/profile'}});
		return;
	}

	email = req.user.emails.id(eid);
	if (!email) {
		console.log("email id doesn't match any of users' emails");
		res.render('profile/email_verify', {messages: {idError: true, back: '/profile'}});
		return;
	} else if (req.query.key !== genEmailVerifyKey(email, req.user)) {
		console.log("email key isn't correct for given email");
		res.render('profile/email_verify', {messages: {idError: true, back: '/profile'}});
		return;
	} else {
		email.verified = Date.now();
		req.user.save();
		res.render('profile/email_verify', {messages: {success: true, email: email.email, continue: req.query.continue || '/profile'}});
	}
};
