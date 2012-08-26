var redis = require('../dbconnect').redis,
	deferred = require('deferred'),
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	tokenExpiration = process.env.ACCESS_TOKEN_DURATION || 60 * 60 * 24 * 7; // default to 7 days

function genCode() {
	return (new Buffer(crypto.randomBytes(24))).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
}
module.exports.genCode = genCode;

module.exports.getAuthCode = function(appauth) {
	var code = genCode(),
		keyCode = "AuthCode:" + code + ":authorization",
		keySecret = "AuthCode:" + code + ":secret",
		keyAuth = "AppAuth:" + String(appauth.id) + ":authcode",
		def = deferred();

	redis.multi()
		.set(keyCode, String(appauth.id))
		.expire(keyCode, 300)
		.set(keySecret, appauth.secret)
		.expire(keySecret, 300)
		.set(keyAuth, code)
		.expire(keyAuth, 300)
		.exec(function (err, replies) {
			def.resolve(err || code);
		});

	return def.promise;
};

module.exports.exchangeAuthCode = function(code, secret) {
	var keyCode = "AuthCode:" + code + ":authorization",
		keySecret = "AuthCode:" + code + ":secret",
		def = deferred();

	redis.multi()
		.get(keyCode)
		.get(keySecret)
		.exec(function (err, replies){
			if(err) {
				def.resolve(err);
				return;
			}

			if(replies[1] !== secret || replies[0] == null) {	
				console.log("Auth code or secret invalid:", replies);			
				def.resolve(new Error("Incorrect secret or auth code."));
				return;
			}

			mongoose.model("AppAuthorization").pFindById(replies[0])(function (appauth) {
				if(!appauth || !appauth.valid) {
					def.resolve(new Error("Incorrect secret or auth code."));
					return;
				}

				var tokencode = genCode(),
					keyToken = "AuthToken:" + tokencode + ":authorization";

				redis.multi()
					.set(keyToken, appauth.id)
					.expire(keyToken, tokenExpiration)
					.exec(function (err) {
						def.resolve(err || tokencode);
					});
			}).end();

		});

	return def.promise;
};

module.exports.getAuthFromToken = function(token) {
	var keyToken = "AuthToken:" + token + ":authorization",
		def = deferred();
	redis.get(keyToken, function (err, authid) {
		if(err) {
			def.resolve(err);
			return;
		}
		mongoose.model("AppAuthorization").pFindById(authid)(function (appauth) {
			if(!appauth || !appauth.valid) {
				def.resolve(new Error("Access token invalid or not specified"));
				return;
			}
			def.resolve(appauth);
		});
	});
	return def.promise;
};
