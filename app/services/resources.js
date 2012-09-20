var deferred = require('deferred'),
	mongoose = require('mongoose'),
	modelcache = require('./modelcache');


function retrieveBasicInfoResource (auth, permission, prefetch) {
	if (permission.resourceId === "preferredName") {
		return prefetch.findById("User", auth.user)(function(user) {
			return user.name;
		});
	}
	throw new Error ("Invalid basic info permission:", permission.resourceId);
}

module.exports.retrieveBasicInfoResource = retrieveBasicInfoResource;

module.exports.retrieveResource = function retrieveResource(auth, permission, prefetch) {
	if (prefetch == null) {
		prefetch = new modelcache.ModelCache();
	}

	if (permission.type === "basicInfo") {
		return retrieveBasicInfoResource(auth, permission, prefetch)(function (value) {
			return {
				type: permission.type,
				id: permission.resourceId,
				value: value
			};
		});
	} else {
		var def = deferred();
		def.resolve({
			type: permission.type,
			id: permission.resourceId,
			value: null
		});
		return def.promise;
	}
};
