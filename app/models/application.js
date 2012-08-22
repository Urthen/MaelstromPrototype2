var crypto = require('crypto'),
	deferred = require('deferred'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var Application = new Schema({
	name: String,
	creator: ObjectId,
	url: String,
	domain: String,
	secret: String,
	created: {type: Date, default: Date.now}
});

Application.methods.regenerateSecret = function regenerateSecret() {	
	this.secret = crypto.randomBytes(10).toString('hex');
};

Application.methods.pSave = function pSave () {
	var def = deferred();
	this.save(function(err){
		def.resolve(err);
	});
	return def;
};


mongoose.model('Application', Application);
var ApplicationProto = mongoose.model('Application');
ApplicationProto.pFind = deferred.promisify(ApplicationProto.find);
ApplicationProto.pFindById = deferred.promisify(ApplicationProto.findById);
