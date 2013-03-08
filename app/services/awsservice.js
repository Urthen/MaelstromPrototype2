var awssum = require('awssum'),
	amazon = awssum.load('amazon/amazon'),
	S3 = awssum.load('amazon/s3').S3;

var s3 = new S3({
	'accessKeyId' : process.env.AWS_ACCESS_ID,
	'secretAccessKey' : process.env.AWS_SECRET_KEY,
	'region' : amazon.US_EAST_1
});

console.log({
	'accessKeyId' : process.env.AWS_ACCESS_ID,
	'secretAccessKey' : process.env.AWS_SECRET_KEY,
	'region' : amazon.US_EAST_1
});

module.exports.uploadFile = function (buffer, name, type, callback) {
	if (callback == null) {
		callback = type;
		type = null;
	}

	var params = {
		BucketName: 'maelstrom',
		ObjectName: name,
		ContentLength: buffer.length,
		Body: buffer,
	};

	if (type == null) {
		params['ContentType'] = "binary/octet-stream";
	} else {
		params['ContentType'] = type;
	}

	s3.PutObject(params, callback);
};

module.exports.getFile = function(name, callback) {
	var params = {
		BucketName: 'maelstrom',
		ObjectName: name
	};

	s3.GetObject(params, callback);
};
