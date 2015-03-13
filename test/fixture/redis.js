module.exports = function () {
    var redis = {};

    redis.multi = function () {
        return redis;
    };

    redis.exec = function (cb) {
        cb();
    };

    return redis;
};
