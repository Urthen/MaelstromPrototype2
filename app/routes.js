var indexController = require('./controllers/index');

module.exports = function(app){

	// Index routes
	app.get('/', indexController.renderIndex);

	
};