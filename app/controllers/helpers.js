exports.requireLogin = function (req, res, next) {
	if (!req.user) {
		res.redirect("/login");
		return;
	} else if (req.user.temporary) {
		res.redirect('/newuser');
		return;
	}
	next();
};
