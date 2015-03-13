var fs = require('fs');
var path = require('path');

var base = __dirname;
var folders = fs.readdirSync(base);

var widgets = module.exports = {};
var widgetFile = 'widget.js';

folders.forEach(function (folder) {
    var widgetPath = path.join(base, folder, widgetFile);

    try {
        if (!fs.lstatSync(widgetPath).isFile()) {
            return;
        }
    } catch (e) { return; }

    var pack = require(widgetPath);
    pack.path = path.join(base, folder);
    widgets[pack.name] = pack;
});
