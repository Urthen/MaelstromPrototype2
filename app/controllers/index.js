exports.renderIndex = function(req, res) {
	res.render('index');
};

exports.renderLogin = function(req, res) {
	if (req.user) {
		if (req.user.temporary) {
			res.redirect('/newuser');
			return;
		} else {
			res.redirect('/');
		}
	}

	res.render('login');
};
