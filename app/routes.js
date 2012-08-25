var indexController = require('./controllers/index'),
	newUserController = require('./controllers/newuser'),
	credentialController = require('./controllers/credential'),
	mailHelpController = require('./controllers/mailhelper'),
	profileController = require('./controllers/profile'),
	emailVerificationController = require('./controllers/emailverify'),
	developerController = require('./controllers/develop'),
	oauthController = require('./controllers/auth/oauth'),
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
	app.get('/profile/edit', helpers.requireLogin, profileController.editProfile);
	app.post('/profile/edit', helpers.requireLogin, profileController.editProfile);	
	app.get('/profile/linked', helpers.requireLogin, profileController.linkedProfiles);

	// Email verification process
	app.get('/email/verify/:id', helpers.requireLogin, emailVerificationController.verifyEmailRoute);
	app.get('/email/verify/send/:id', helpers.requireLogin, emailVerificationController.sendVerificationRoute);

	// Develop applications
	app.get('/dev', helpers.requireLogin, developerController.landingPage);
	app.get('/dev/app/create', helpers.requireLogin, developerController.createAppPage);
	app.post('/dev/app/create', helpers.requireLogin, developerController.createAppPage);
	app.get('/dev/app/edit/:appid', helpers.requireLogin, helpers.getApp, developerController.editAppPage);
	app.post('/dev/app/edit/:appid', helpers.requireLogin, helpers.getApp, developerController.editAppPage);
	app.post('/dev/app/regenkey/:appid', helpers.requireLogin, helpers.getApp, developerController.regenKey);


	//oAuth2 Authentication
	app.get('/auth/oauth/authorize', helpers.getApp, oauthController.login);

	// Preview Emails (not in production, obviously)
	if (process.env.NODE_ENV !== 'production') {
		app.post('/mailtest/preview', mailHelpController.previewEmail);
		app.post('/mailtest/send', mailHelpController.sendEmail);
	}

	// omg secret
	app.get('/charybdis', function(req, res) { res.end('here be monsters'); });
};
