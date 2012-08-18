var indexController = require('./controllers/index'),
	credential = require('./controllers/credential'),
	passport = require('passport'),
	helpers = require('./controllers/helpers');

module.exports = function(app){

	// Landing page routes
	app.get('/', helpers.requireLogin, indexController.renderIndex);
	app.get('/login', indexController.renderLogin);

	// Authorize credentials routes
	app.get('/auth/facebook', credential.catchRedirectArgs, passport.authenticate('facebook'));
	app.get('/auth/facebook/callback', 
			passport.authenticate('facebook'), credential.redirectAfterLogin);
	app.get('/auth/twitter', credential.catchRedirectArgs, passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', 
			passport.authenticate('twitter'), credential.redirectAfterLogin);

	// Logout/disconnect from credentials
	app.get('/logout', credential.catchRedirectArgs, credential.logout);
	app.get('/auth/disconnect/:id', helpers.requireLogin, credential.disconnect);	
};
