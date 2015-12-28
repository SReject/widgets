var redis = require('./fixture/redis');
var mysql = require('./fixture/mysql');
var graphite = require('./fixture/graphite');
var channel = require('./fixture/channel');
var user = require('./fixture/user');
var log = require('./fixture/log');
var clip = require('../clip');

require('chai').use(require('chai-subset'));

beforeEach(function () {
    clip.redis = redis();
    clip.mysql = mysql();
    clip.graphite = graphite();
    clip.log = log();
    clip.config = { beam: 'https://beam.pro' };
    this.channel = channel(this.redis);
    this.user = user(this.channel);
});
