var Bluebird = require('bluebird');
var request = Bluebird.promisify(require('request'));

/**
 * Function to run an HTTP request. Externalized for common use
 * and mocking.
 * @return {Promise}
 */
exports.run = function () {
    return request.apply(request, arguments);
};
