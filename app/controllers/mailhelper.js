var mailer = require('../mailer');

function getSettingsFromReq(req) {
	var vars = {};
	for (var parameter in req.body) {
		vars[parameter] = req.body[parameter];
	}
	return vars;
}

exports.previewEmail = function previewMail (req, res) {
	var vars = getSettingsFromReq(req);

	if(vars.templateName === undefined) {
		res.end("templateName is a required parameter");
		return;
	}

	try {
		mailer.renderEmail(vars.templateName, vars, function (err, html, text) {
			if (err) {
				res.end("Error: " + err);
			} else {
				if (vars.useText && vars.useText === 'true') {
					res.end(text);
				} else {
					res.end(html);
				}
			}
		});
	} catch(e) {
		res.end("Unknown error: " + e);
	}
};

exports.sendEmail = function sendEmail (req, res) {
	var vars = getSettingsFromReq(req);

	if (vars.fromEmail === undefined || vars.toEmail === undefined ||
		vars.emailSubject === undefined || vars.templateName === undefined) {
		res.end("fromEmail, toEmail, emailSubject, and templateName are all required parameters.");
		return;
	}

	try {
		mailer.renderEmail(vars.templateName, vars, function (err, html, text) {
			if (err) {
				res.end("Error: " + err);
			} else {
				mailer.sendOne({
					from: vars.fromEmail,
					to: vars.toEmail,
					subject: vars.emailSubject,
					html: html,
					text: text
				}, function(err) {
					if (err) { 
						res.end("Error: " + err);
					} else {
						res.end("Sent to mailgun");
					}
				});
			}
		});
	} catch(e) {
		res.end("Unknown error: " + e);
	}
};