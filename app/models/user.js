var mongoose = require('mongoose'),
	deferred = require('deferred'),
	Schema = mongoose.Schema,

// Schema for foreign credentials, as in Facebook, Twitter, etc
	ForeignCredential = new Schema({
		uid: {type: String, index: true},
		type: {type: String, index: true},
		created: {type: Date, default: Date.now},
		name: String
	})

mongoose.model('ForeignCredential', ForeignCredential);
var ForeignCredentialModel = mongoose.model('ForeignCredential'),

// Primary schema for user objects
	User = new Schema({
		name: String,
		credentials: [ForeignCredential],
		created: {type: Date, default: Date.now},
		accessed: {type: Date, default: Date.now},
		temporary: {type: Boolean, default: false}
	});

// Add a given credential we've just connected with to a user.
User.methods.addCredential = function addCredential (profile) {
	if (this.hasCredential(profile.provider, profile.id)) {
		return false;
	}
	credential = new ForeignCredentialModel();
	credential.uid = profile.id;
	credential.type = profile.provider;
	credential.name = profile.displayName;
	this["credentials"].push(credential)
	return true;
}

// Determine if a given user has a credential.
User.methods.hasCredential = function hasCredential (provider, uid) {
	for (var i in this["credentials"]) {
		if (this["credentials"][i].type === provider && (!uid || this["credential"][i].uid === uid)) return true;
	}
	return false;
}

// Return a dictionary of credential lists by provider
User.methods.listCredentials = function listCredentials () {
	var output = {},
		credential;
	
	for (var i in this["credentials"]) {
		credential = this["credentials"][i];
		if (output[credential.type] === undefined) output[credential.type] = [];
		output[credential.type].push(credential);
	}

	return credential;
}

// Find a user by given credential
User.statics.findByCredential = function findByCredential (profile) {
	var query = {}
		query["credential.uid"] = profile.id,
		query["credential.type"] = profile.provider,
		def = deferred();

	this.pFindOne(query)(function(user) {
		if (user) {
			user.accessed = Date.now();
			user.save();
		} else {
			user = new (mongoose.model('User'))();
			user.name = profile.displayName;
			user.addCredential(profile);
			user.save();
		}
		def.resolve(user);
	}).end();

	return def.promise;
}

// Add any additional promisified functionality here.
mongoose.model('User', User);
var userProto = mongoose.model('User');

userProto.pFind = deferred.promisify(userProto.find);
userProto.pFindOne = deferred.promisify(userProto.findOne);
