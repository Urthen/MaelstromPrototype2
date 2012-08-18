var https = require('https'),
	querystring = require('querystring'),
	authstring = new Buffer('api:' + process.env.MAILGUN_API_KEY).toString('base64');

exports.sendOne = function sendOne(message, callback) {
	var body = querystring.stringify(message),
		opts = {
			host: 'api.mailgun.net',
			port: 443,
			method: "POST",
			path: '/v2/maelstrom.mailgun.org/messages',

			headers: {
				'Authorization': 'Basic ' + authstring,
				'Content-Type':'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(body)
			}
		},
		req = https.request(opts, function(res) {
			if (callback) callback(res.statusCode != 201 ? new Error(res.statusCode) : undefined);
		});
	req.end(body);
}