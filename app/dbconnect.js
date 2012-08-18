var express = require('express'),
	RedisStore = require('connect-redis')(express),
	redis;

if (process.env.REDISTOGO_URL) {
	var rtg = require('url').parse(process.env.REDISTOGO_URL);
		redis = require('redis').createClient(rtg.port, rtg.hostname);
	redis.auth(rtg.auth.split(':')[1]);
} else {
	redis = require("redis").createClient();
}

exports.redis = new RedisStore({client: redis});