var indexController = require('./controllers/index'),
	newUserController = require('./controllers/newuser'),
	credentialController = require('./controllers/credential'),
	profileController = require('./controllers/profile'),
	passport = require('passport'),
	helpers = require('./controllers/helpers');

module.exports = function(app){

	// Landing page routes
	app.get('/', helpers.requireLogin, indexController.renderIndex);
	app.get('/login', indexController.renderLogin);

	// Authorize credentials routes
	app.get('/auth/facebook', credentialController.catchRedirectArgs, passport.authenticate('facebook'));
	app.get('/auth/facebook/callback', 
			passport.authenticate('facebook'), credentialController.redirectAfterLogin);
	app.get('/auth/twitter', credentialController.catchRedirectArgs, passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', 
			passport.authenticate('twitter'), credentialController.redirectAfterLogin);

	// Users are redirected here after creating an account and are prompted to confirm they want an account.
	app.get('/newuser', newUserController.newUser);
	app.post('/newuser/confirm', newUserController.newUserConfirm, credentialController.redirectAfterLogin);
	app.get('/newuser/decline', newUserController.newUserDecline);

	// Logout/disconnect from credentials
	app.get('/logout', credentialController.catchRedirectArgs, credentialController.logout);
	app.get('/auth/disconnect/:id', helpers.requireLogin, credentialController.disconnect);	

	// User Profile Management
	app.get('/profile', helpers.requireLogin, profileController.showProfile);
};
