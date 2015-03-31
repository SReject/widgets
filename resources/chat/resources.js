var Bluebird = require('bluebird');
var clip = require('../../clip');
var _ = require('lodash');

var resources = module.exports = {};

// Keep track of resources we want to load. It's a map of strings to
// handler functions - handler functions can exist, or be null.
resources.list = {};

/**
 * Registers a new resource type to be loaded when users join. If an alias
 * is given, that can be passed to .get() rather than the type. If you
 * specify a custom handler (which takes an array of resources and should
 * return "some" value) then an alias is required.
 *
 * @param  {String} type
 * @param  {Function=} handler
 * @param  {String=} alias
 */
resources.load = function (type, alias, handler) {
    resources.list[alias || type] = { handler: handler, type: type };
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
    return '\'' + _.pluck(resources.list, 'type').join('\', \'') + '\'';
};

/**
 * Method that should be attached to the user (or, at least, run in the
 * context of a user) which returns resources of the type that
 * the user has access to.
 *
 * @param {String} type
 * @return {Promise}
 */
resources.get = function (name) {
    var user = this;
    var list = resources.list;

    // If we already got resources for the user, just resolve the
    // resource that we're looking for.
    if (user._resourceCache) {
        return Bluebird.resolve(user._resourceCache[name] || []);
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
        // Get the unique IDs and group the output by its "type"
        var groupings = _(resources)
            .uniq('id')
            .groupBy('type')
            .value();

        // Set the resource cache based on everything we registered to
        // list, passing data through a handler function if necessary.
        user._resourceCache = _.mapValues(list, function (record, key) {
            var data = groupings[record.type];
            if (record.handler) {
                return record.handler(data);
            } else {
                return data;
            }
        });

        return user._resourceCache[name] || [];
    });
};
