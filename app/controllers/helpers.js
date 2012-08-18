exports.requireLogin = function (req, res, next) {
	if (!req.user) {
		res.redirect("/new");
		return;
	}
	next();
};
