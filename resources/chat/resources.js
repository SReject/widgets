var Bluebird = require('bluebird');
var clip = require('../../clip');
var _ = require('lodash');

var resources = module.exports = {};

// Keep track of resources we want to load. It's a map of strings to
// handler functions - handler functions can exist, or be null.
resources.list = {};

/**
 * Registers a new resource type to be loaded when users join.
 * @param  {String} type
 * @param  {Function=} handler
 */
resources.load = function (type, handler) {
    // Currently, if multiple modules load the same type of resource
    // we don't support handler functions. Throw an error if it happens.
    if (resources.list[type] && handler) {
        throw new Error('Cannot load multiple of a type using a handler!');
    } else {
        resources.list[type] = handler || null;
    }
};

/**
 * Attaches the "getResource" method to users.
 * @param  {User} user
 */
resources.bindUser = function (user) {
    user.getResource = resources.get;
};

/**
 * Returns the "WHERE IN (...)" string for the SQL query.
 * @return {String}
 */
resources.inQuery = function () {
    return '\'' + _.keys(resources.list).join('\', \'') + '\'';
};

/**
 * Method that should be attached to the user (or, at least, run in the
 * context of a user) which returns resources of the type that
 * the user has access to.
 * @param {String} type
 * @return {Promise}
 */
resources.get = function (type) {
    var user = this;
    var list = resources.list;

    // If we already got resources for the user, just resolve the
    // type that we're looking for.
    if (user._resourceCache) {
        return Bluebird.resolve(user._resourceCache[type] || []);
    }

    return clip.mysql.queryAsync(
        'select `resource`.* from `resource_allowance` ' +
        'inner join `resource` on `resource`.`id` = `resource_allowance`.`resource` ' +
        'where (`resource_allowance`.`user` = ? or `resource_allowance`.`group` in ( ' +
        '    select `group`.`id` from `group` ' +
        '    inner join `group_users__user_groups` on `group_users__user_groups`.`group_users` = `group`.`id` ' +
        '    where `group_users__user_groups`.`user_groups` = ? ' +
        ')) and `resource`.`type` IN (' + resources.inQuery() + ');', [user.id, user.id]
    ).spread(function (resources) {
        user._resourceCache = _(resources)
            .uniq('id')
            .groupBy('type')
            .mapValues(function (resources, type) {
                if (list[type]) {
                    return resources.map(list[type]);
                } else {
                    return resources;
                }
            })
            .value();

        return user._resourceCache[type] || [];
    });
};
