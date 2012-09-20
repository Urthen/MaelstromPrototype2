var deferred = require('deferred'),
	mongoose = require('mongoose');

var ModelCache = function (preload) {
	if(preload) {
		this.cache = preload;
	} else {
		this.cache = {};
	}
}

ModelCache.prototype.findById = function(model, id) {
	var def = deferred(),
		modelCache;
	if (model in cache) {
		modelCache = cache[model];
	} else {
		modelCache = {};
		cache[model] = modelCache;
	}
	if (id in modelCache) {
		def.resolve(modelCache[id]);
	} else {
		mongoose.model(model).findById(id, function(err, obj) {
			if (err) {
				def.resolve(err);
			} else {
				modelCache[id] = obj;
				def.resolve(obj);
			}
		});
	}
	return def;
}

module.exports.ModelCache = ModelCache;
