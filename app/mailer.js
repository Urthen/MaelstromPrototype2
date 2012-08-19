var https = require('https'),
	deferred = require('deferred'),
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

function sendOne(message) {
	def = deferred();
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
			def.resolve(res.statusCode > 201 ? new Error(res.statusCode) : undefined);
		});
	req.end(body);
	return def.promise;
}

exports.sendOne = sendOne;

function renderEmail(templateName, vars) {
	var def = deferred();
	if(!emailRenderer) {
		console.log("Email renderer didn't load correctly.");
		def.resolve(new Error("Attempted to send email template but email renderer not loaded"));
		return;
	}

	emailRenderer(templateName, vars, function(err, html, text) {
		def.resolve(html, text);
	});

	return def.promise;
}
exports.renderEmail = renderEmail;

exports.sendTemplate = function sendTemplate(templateName, options, templateVars) {
	var def = deferred();
	renderEmail(templateName, templateVars)(function(html, text) {
		options.html = html;
		options.text = text;
		sendOne(options)(function(){
			def.resolve();
		});
	}).end();
	return def.promise();
};
