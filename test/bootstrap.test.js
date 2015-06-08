var redis = require('./fixture/redis');
var mysql = require('./fixture/mysql');
var channel = require('./fixture/channel');
var user = require('./fixture/user');
var clip = require('../clip');

beforeEach(function () {
    clip.redis = redis();
    clip.mysql = mysql();
    clip.config = { beam: 'https://beam.pro' };
    this.channel = channel(this.redis);
    this.user = user(this.channel);
});
