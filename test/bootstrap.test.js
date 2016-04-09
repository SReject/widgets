var redis = require('./fixture/redis');
var mysql = require('./fixture/mysql');
var influx = require('./fixture/influx');
var channel = require('./fixture/channel');
var user = require('./fixture/user');
var log = require('./fixture/log');
var clip = require('../clip');
var _ = require('lodash');

require('chai').use(require('chai-subset'));
require('chai').use(require('sinon-chai'));

beforeEach(function () {
    clip.redis = redis();
    clip.mysql = mysql();
    clip.influx = influx();
    clip.log = log();
    clip.config = { beam: 'https://beam.pro' };

    _.extend(this, clip);

    this.channel = channel(this.redis);
    this.user = user(this.channel);
});
