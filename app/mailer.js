var https = require('https'),
	querystring = require('querystring'),
	authstring = new Buffer('api:' + process.env.MAILGUN_API_KEY).toString('base64'),
	path = require('path'),
	templatesDir = path.join(__dirname, 'templates', 'email'),
	emailTemplates = require('email-templates'),
	emailRenderer;

emailTemplates(templatesDir, function(err, template) {
	if (err) {
		console.log(err);
	} else {
		emailRenderer = template;
	}
});

function sendOne(message, callback) {
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
			if (callback) { callback((res.statusCode > 201) ? new Error(res.statusCode) : undefined); }
		});
	req.end(body);
}

exports.sendOne = sendOne;

function renderEmail(templateName, vars, callback) {
	if(!emailRenderer) {
		console.log("Email renderer didn't load correctly.");
		callback(new Error("Attempted to send email template but email renderer not loaded"));
		return;
	}

	emailRenderer(templateName, vars, callback);
}
exports.renderEmail = renderEmail;

exports.sendTemplate = function sendTemplate(templateName, options, templateVars, callback) {
	renderEmail(templateName, templateVars, function(err, html, text) {
		if (err) {
			callback(err);
		} else {
			options.html = html;
			options.text = text;
			sendOne(options, callback);
		}
	});
};
