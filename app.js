var express = require("express"),
	port = process.env.PORT || 5000,
	app = express();

// Set up the settings
require("./app/settings")(app);

// Set up the models
require("./app/models/");

// Set up the router
require("./app/routes")(app);

// Good to go
app.listen(port, function () {
	console.log("Maelstrom server listening on port %d in %s mode\n     Go make some thunder...", port, app.settings.env);
});
