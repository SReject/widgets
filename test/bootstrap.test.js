var redis = require('./fixture/redis');
var channel = require('./fixture/channel');
var user = require('./fixture/user');
var clip = require('../clip');

beforeEach(function () {
    clip.redis = redis();
    this.channel = channel(this.redis);
    this.user = user(this.channel);
});
