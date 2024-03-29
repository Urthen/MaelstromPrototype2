var url = require('url'),
	validator = require('validator'),
	mongoose = require('mongoose'),
	AppAuthorization = mongoose.model("AppAuthorization"),
	Application = mongoose.model("Application"),
	User = mongoose.model("User"),
	tokenService = require("../../services/tokens"),
	permissiondefs = require("../../services/permissiondefs");

exports.login = function oauthLogin (req, res) {
	if (req.user && req.user.temporary) {
		res.redirect('/newuser');
		return;
	}
	
	var callback = req.query.redirect_uri || req.application.redirect,
		opts = {
			user: req.user,
			application: req.application,
			callback: validator.sanitize(req.query.redirect_uri).xss(),
			redirect: encodeURIComponent('/auth/oauth/authorize?client_id=' + validator.sanitize(req.query.client_id).xss() + 
				"&redirect_uri=" + encodeURIComponent(validator.sanitize(req.query.redirect_uri).xss())),
			newAuthorization: true,
			permissiondefs: permissiondefs
		},
		parsed = url.parse(req.query.redirect_uri);

	if(parsed.hostname !== req.application.domain) {
		console.log("Hostname doesn't match app domain, may be security threat:", parsed.hostname, req.application.id, req.application.domain);
		res.send(401, "The requested redirect URI is not valid for this application. This may have been an attempt to compromise your account. " +
				"For your safety, we have stopped access. If you are developing an application, double-check your redirect URI against your application domain.");
		return;
	}

	if(req.user) {
		var requestedPermissions = req.query.scope? req.query.scope.split(',') : [];

		AppAuthorization.pFindOne({user: req.user.id, application: req.application.id})(function (auth) {
			if(auth && auth.valid) {
				var requestedPermission, existingPermission, type, rid, newPermissions = [], found = false;
				for(var i = 0; i < requestedPermissions.length; i++) {
					requestedPermission = requestedPermissions[i];
					type = requestedPermission.split('.')[0];
					rid = requestedPermission.split('.')[1];
					found = false;
					for (var ii = 0; ii < auth.permissions.length; ii++) {
						existingPermission = auth.permissions[i];
						if (existingPermission.type === type && existingPermission.resourceId === rid && existingPermission.isValid()) {
							found = true;
							break;
						}
					}
					if (!found) {
						newPermissions.push(requestedPermission);
					}
				}

				if(newPermissions.length === 0) {					
					// No new permissions, just return.
					auth.getAuthCode()(function (code) {
						var orig_url = url.parse(req.query.redirect_uri, true);
						orig_url.query['code'] = code;
						res.redirect(url.format(orig_url));	
					}).end();

					return;

				} else {
					opts["requestedPermissions"] = newPermissions;
					opts["newAuthorization"] = false;
					res.render('auth/authorize', opts);	
				}
			} else {
				opts["requestedPermissions"] = requestedPermissions;
				res.render('auth/authorize', opts);		
			}
		}, function (err) {
			console.log("Error attempting to get existing app auth:", err);
			res.render('auth/authorize', opts);
		});
	} else {
		res.render('auth/authorize', opts);
	}
	
};

exports.confirm = function oauthConfirm(req, res) {
	req.user.addAppAuth(req.application)(function (permission) {
		var newPermissions = req.body.approved_scope ? req.body.approved_scope.split(",") : [],
			newPermission;
		for(var i = 0; i < newPermissions.length; i++) {
			newPermission = newPermissions[i];
			permission.addPermission(newPermission);	
		}
		
		return permission.pSave();		
	})(function (permission){
		return permission.getAuthCode();		
	})(function (code) {		
		var orig_url = url.parse(req.body.redirect_uri, true);
		orig_url.query['code'] = code;
		res.redirect(url.format(orig_url));
	}).end();
};

exports.exchange = function oauthExchange(req, res) {
	tokenService.exchangeAuthCode(req.body.code, req.body.client_secret)(function(token){
		res.send(JSON.stringify({
			access_token: token
		}));
	}, function(err){
		res.send(400, JSON.stringify({
			error: String(err)
		}));
	}).end();
};
