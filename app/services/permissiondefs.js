//At some point in the future, replace this with something more dynamic!
var permissionDefsMap = {
	"basicInfo": {
		"preferredName": "Your preferred name."
	}
}

function getDescription(type, resourceId) {
	if (!resourceId) {
		// we were passed in an un-split identifier
		var permission = type;
		type = permission.split('.')[0],
		resourceId = permission.split('.')[1];
	}

	if (type in permissionDefsMap && resourceId in permissionDefsMap[type]) {
		return permissionDefsMap[type][resourceId];
	}
	console.log("Unknown permission:", type, resourceId);
	return type + '.' + resourceId;
}

module.exports.getDescription = getDescription;