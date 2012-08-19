exports.showProfile = function(req, res) {
	res.render('profile');
};

exports.editProfile = function(req, res) {

	if (req.route.method === 'post') {
		req.user.name = req.body.preferredName;
		req.user.save(function(err) {
			res.render('profile_edit');
		})
	} else {
		res.render('profile_edit');
	}
};