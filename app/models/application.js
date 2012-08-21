var crypto = require('crypto'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var ApplicationRecord = new Schema({
	name: String,
	creator: ObjectId,
	url: String,
	domain: String,
	secret: String,
	created: {type: Date, default: Date.now}
});

ApplicationRecord.methods.regenerateSecret = function regenerateSecret(cb) {
	var that = this;
	crypto.randomBytes(10, function(ex, buf) {
		that.secret = buf.toString('hex');
		cb();
	});
};

mongoose.model('ApplicationRecord', ApplicationRecord);