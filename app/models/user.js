var mongoose = require('mongoose'),
	deferred = require('deferred'),
	Schema = mongoose.Schema,

// Schema for foreign credentials, as in Facebook, Twitter, etc
	ForeignCredential = new Schema({
		uid: {type: String, index: true},
		type: {type: String, index: true},
		created: {type: Date, default: Date.now},
		name: String,
		account: String
	});

mongoose.model('ForeignCredential', ForeignCredential);
var ForeignCredentialModel = mongoose.model('ForeignCredential'),

// Schema for user email addresses and whether or not they are verified
	UserEmail = new Schema({
		email: String,
		verified: Date
	});

mongoose.model('UserEmail', UserEmail);
var UserEmailModel = mongoose.model('UserEmail'),

// Primary schema for user objects
	User = new Schema({
		name: String,
		emails: [UserEmail],
		credentials: [ForeignCredential],
		created: {type: Date, default: Date.now},
		accessed: {type: Date, default: Date.now},
		temporary: {type: Boolean, default: true}
	});

// Determine if a user already has this email attached
User.methods.getEmail = function hasEmail (email) {
	for (var i in this["emails"]) {
		if (this["emails"][i].email === email) { return this["emails"][i].email; }
	}
	return null;
};

User.statics.findByEmail = function findByEmail (email) {
	var query = {
		"emails.email": email
	}, def = deferred();

	this.pFindOne(query)(function(user) {
		def.resolve(user);
	}).end();
	return def.promise;
};

// Add an email address
User.methods.addEmail = function addEmail (email) {
	var def = deferred(),
		that = this,
		existing = this.getEmail(email);

	// If they've already added the email, just allow it immediately.
	if (existing) {
		def.resolve(existing);
	} else {
		// Check to make sure that no other user has this email
		mongoose.model("User").findByEmail(email)(function (user) {
			if (user) {
				// If they do, return false.
				def.resolve(null);
			} else {
				// Otherwise, add the email and return true.
				var emailObj = new UserEmailModel();
				emailObj.email = email;
				that["emails"].push(emailObj);
				def.resolve(emailObj);
			}
		}).end();
	}

	return def.promise;
};

// Add a given credential we've just connected with to a user.
User.methods.addCredential = function addCredential (profile) {
	if (this.hasCredential(profile.provider, profile.id)) {
		return false;
	}
	var credential = new ForeignCredentialModel();
	credential.uid = profile.id;
	credential.type = profile.provider;
	credential.name = profile.displayName;
	credential.account = profile.screen_name || profile.username || null;
	this["credentials"].push(credential);
	return true;
};

// Determine if a given user has a credential.
User.methods.hasCredential = function hasCredential (provider, uid) {
	for (var i in this["credentials"]) {
		if (this["credentials"][i].type === provider && (!uid || this["credentials"][i].uid === uid)) { return true; }
	}
	return false;
};

// Return a dictionary of credential lists by provider
User.methods.listCredentials = function listCredentials () {
	var output = {},
		credential;
	
	for (var i in this["credentials"]) {
		credential = this["credentials"][i];
		if(!credential.type) { continue; }
		if (output[credential.type] === undefined) { output[credential.type] = []; }
		output[credential.type].push(credential);
	}

	console.log(output);

	return output;
};

// Find a user by given credential
User.statics.findOrAddByCredential = function findByCredential (profile) {
	var query = {},
		def = deferred();

	query["credentials.uid"] = profile.id;
	query["credentials.type"] = profile.provider;

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
};

User.methods.pSave = function pSave () {
	var def = deferred();
	this.save(function(err){
		def.resolve(err);
	});
	return def.promise;
};

// Add any additional promisified functionality here.
mongoose.model('User', User);
var userProto = mongoose.model('User');
userProto.pFind = deferred.promisify(userProto.find);
userProto.pFindOne = deferred.promisify(userProto.findOne);
