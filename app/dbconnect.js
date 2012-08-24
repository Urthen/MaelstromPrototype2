var express = require('express'),
	mongoose = require("mongoose"),
	RedisStore = require('connect-redis')(express),
	mongo_uri = (process.env.MONGOLAB_URI || "mongodb://localhost:27017/maelstrom"),
	redis;

// Connect to mongodb
mongoose.connect(mongo_uri);

// If we're on Heroku and have a redistogo URL, use that. Otherwise, we're local, so use a local instance.
if (process.env.REDISTOGO_URL) {
	var rtg = require('url').parse(process.env.REDISTOGO_URL);
		redis = require('redis').createClient(rtg.port, rtg.hostname);
	redis.auth(rtg.auth.split(':')[1]);
} else {
	redis = require("redis").createClient();
}

exports.redis = redis;
exports.redisStore = new RedisStore({client: redis});
