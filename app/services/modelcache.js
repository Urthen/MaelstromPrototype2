var deferred = require('deferred'),
	mongoose = require('mongoose');

var ModelCache = function (preload) {
	if(preload) {
		this.cache = preload;
	} else {
		this.cache = {};
	}
};

ModelCache.prototype.findById = function(model, id) {
	var def = deferred(),
		modelCache;
	if (model in this.cache) {
		modelCache = this.cache[model];
	} else {
		modelCache = {};
		this.cache[model] = modelCache;
	}
	if (id in modelCache) {
		console.log("Cache hit:", model, id);
		def.resolve(modelCache[id]);
	} else {
		console.log("Cache miss:", model, id);
		// Dont use my custom pFindById as we can't be sure it exists for this particular model.
		mongoose.model(model).findById(id, function(err, obj) {
			if (err) {
				def.resolve(err);
			} else {
				modelCache[id] = obj;
				def.resolve(obj);
			}
		});
	}
	return def.promise;
};

module.exports.ModelCache = ModelCache;
