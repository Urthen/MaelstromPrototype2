var mongoose = require('mongoose'),
	deferred = require('deferred'),
	ModelCache = require('../../services/modelcache').ModelCache,
	resources = require('../../services/resources'),
	User = mongoose.model("User"),
	permissionIDMap = {
		preferredName: "name"
	};

exports.getInfo = function info(req, res) {
	deferred(User.pFindById(req.authorization.user), req.authorization.isAdminUser())(function(result){
		var identity = {
				user: req.authorization.getExternalUID(),
				admin: result[1]
			},
			deferredList = [],
			prefetch = new ModelCache();

		for (var i = 0; i < req.authorization.permissions.length; i++) {
			var permission = req.authorization.permissions[i];

			if (permission.type === "basicInfo" && permission.resourceId in permissionIDMap) {
				deferredList.push(resources.retrieveResource(req.authorization, permission, prefetch));
			}
		}

		if (deferredList.length > 0) {
			deferred.apply(deferred, deferredList)(function(results) {
				// Minor hack; deferred doesn't pack the result into a list if there is only one. Jerks.
				if (deferredList.length === 1) {
					results = [results];
				}
				for(var i = 0; i < results.length; i++) {
					var result = results[i];
					if (result.id in permissionIDMap) {
						identity[permissionIDMap[result.id]] = result.value;
					}
				}	
				res.send(identity);		
			}).end();
		} else {
			res.send(identity);	
		}
	}).end();
};
