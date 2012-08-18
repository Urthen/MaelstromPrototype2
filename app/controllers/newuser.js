var mongoose = require('mongoose'),
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

	req.user.temporary = false;
	req.user.save(function(err) {
		next(err);
	});
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