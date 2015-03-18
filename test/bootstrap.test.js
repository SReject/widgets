var redis = require('./fixture/redis');
var channel = require('./fixture/channel');
var user = require('./fixture/user');

beforeEach(function () {
    this.ctx = { redis: redis() };
    this.channel = channel(this.redis);
    this.user = user(this.channel);
});
