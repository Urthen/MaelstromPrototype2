var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	deferred = require('deferred'),
	tokenService = require('../services/tokens');

var AppAuthorization = new Schema({
	user: Schema.ObjectId,
	application: Schema.ObjectId,
	valid: {type: Boolean, default: false},
	created: {type: Date, default: Date.now}
});


AppAuthorization.methods.getExternalUID = function getExternalUID () {
	var shasum = crypto.createHash('sha1');
	shasum.update(String(this.user));
	shasum.update(String(this.application));
	return shasum.digest('hex');
};

AppAuthorization.methods.getAuthCode = function getAuthCode () {
	return tokenService.getAuthCode(this);
};

// deferred wrapper for save
AppAuthorization.methods.pSave = function pSave () {
	var def = deferred(),
		that = this;
	this.save(function(err){
		def.resolve(err || that);
	});
	return def.promise;
};

mongoose.model('AppAuthorization', AppAuthorization);

// Add any additional promisified functionality here.
var appAuth = mongoose.model('AppAuthorization');
appAuth.pFind = deferred.promisify(appAuth.find);
appAuth.pFindOne = deferred.promisify(appAuth.findOne);