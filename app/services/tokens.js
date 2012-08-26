var redis = require('../dbconnect').redis,
	crypto = require('crypto');

function genCode() {
	return (new Buffer(crypto.randomBytes(24))).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
}
module.exports.genCode = genCode;

module.exports.getAuthCode = function(appauth) {
	var code = genCode(),
		keyCode = "AuthCode:" + code + ":authorization",
		keyAuth = "AppAuth:" + String(appauth.id) + ":authcodes";

	redis.set(keyCode, String(appauth.id));
	redis.expire(keyCode, 300);
	redis.sadd(keyAuth, code);
	redis.expire(keyAuth, 300);

	return code;
};