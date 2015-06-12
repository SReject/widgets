var redis = require('./fixture/redis');
var mysql = require('./fixture/mysql');
var graphite = require('./fixture/graphite');
var channel = require('./fixture/channel');
var user = require('./fixture/user');
var clip = require('../clip');

beforeEach(function () {
    clip.redis = redis();
    clip.mysql = mysql();
    clip.graphite = graphite();
    this.channel = channel(this.redis);
    this.user = user(this.channel);
});
