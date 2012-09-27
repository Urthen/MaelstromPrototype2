var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	deferred = require('deferred'),
	tokenService = require('../services/tokens'),
	resources = require('../services/resources'),
	permissiondefs = require('../services/permissiondefs');

var AppPermission = new Schema({
	created: {type: Date, default: Date.now},
	auth: Schema.ObjectId,
	expires: Date,
	type: String,
	description: String,
	resourceId: String
});

AppPermission.methods.isValid = function isValid () {
	return (this.expires == null || this.expires === undefined) || this.expires > Date.now();
};

AppPermission.methods.getDescription = function getDescription () {
	if (this.description) {
		return this.description; 
	} else {
		return permissiondefs.getDescription(this.type, this.resourceId);
	}
}

mongoose.model("AppPermission", AppPermission);

var AppPermissionModel = mongoose.model("AppPermission"),
	AppAuthorization = new Schema({
		user: Schema.ObjectId,
		application: Schema.ObjectId,
		secret: String,
		valid: {type: Boolean, default: false},
		created: {type: Date, default: Date.now},
		permissions: [AppPermission]
	});

AppAuthorization.methods.addPermission = function addPermission(identifier, description, duration) {
	var permission = new AppPermissionModel(),
		type = identifier.split('.')[0],
		resourceId = identifier.split('.')[1];
	permission.type = type;
	permission.resourceId = resourceId;
	permission.description = description;
	permission.auth = this;
	if (duration) {
		permission.expires = new Date(Date.now().getTime() + duration * 60000);
	}
	this.permissions.push(permission);
};

AppAuthorization.methods.getExternalUID = function getExternalUID () {
	var shasum = crypto.createHash('sha1');
	shasum.update(String(this.user));
	shasum.update(String(this.application));
	return shasum.digest('hex');
};

AppAuthorization.methods.getAuthCode = function getAuthCode () {
	return tokenService.getAuthCode(this);
};

AppAuthorization.methods.isAdminUser = function isAdminUser () {
	var that = this;
	return mongoose.model("Application").pFindById(this.application)(function (application) {
		return '' + that.user === '' + application.creator;
	});
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
appAuth.pFindById = deferred.promisify(appAuth.findById);
