var fs = require('fs');
var path = require('path');
var toposort = require('toposort');

/**
 * Helper function to check if a file path exists, since Node.js
 * is stupid and deprecated the easy way to do this.
 * @param  {String} file
 * @return {Boolean}
 */
function exists (file) {
    try {
        return fs.lstatSync(file).isFile();
    } catch (e) {
        return false;
    }
}

/**
 * Loads and returns an array of imported widget.js'es from the
 * subfolders of this directory.
 * @return {Object}
 */
function loadWidgets () {
    var base = __dirname;
    var folders = fs.readdirSync(base);
    var widgetFile = 'widget.js';
    var widgets = [];

    for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        var widgetPath = path.join(base, folder, widgetFile);

        if (!exists(widgetPath)) {
            continue;
        }

        var pack = require(widgetPath);
        pack.path = path.join(base, folder);
        widgets[folder] = pack;
    }

    return widgets;
}

/**
 * Return topologically sorted widgets in the order that they
 * must be loaded.
 * @return {Array}
 */
function getSorted () {
    var widgets = loadWidgets();
    var loads = [];
    var possiblyUnloaded = [];

    for (var key in widgets) {
        var dependencies = widgets[key].dependencies;
        // For widgets that don't have dependencies, skip them. Others will
        // depend on them but, if not, we'll load them later.
        if (!dependencies || dependencies.length === 0) {
            possiblyUnloaded.push(key);
            continue;
        }

        // Otherwise add dependencies on to the loads.
        for (var k = 0; k < dependencies.length; k++) {
            loads.push([ dependencies[k], key ]);
        }
    }

    loads = toposort(loads);

    // Now see anything we're missing from the topo graph.
    for (var i = 0; i < possiblyUnloaded.length; i++) {
        if (loads.indexOf(possiblyUnloaded[i]) === -1) {
            loads.push(possiblyUnloaded[i]);
        }
    }

    // And finally map the dependency graph back into widget objects.
    return loads.map(function (w) { return widgets[w]; });
}

module.exports = getSorted();
