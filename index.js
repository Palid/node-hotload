"use strict";
var path = require('path'),
    methods = {};

/**
 * hotLoad re-requires module by removing it from cache on events
 * @param  {String} dirname Usually your current dir, __dirname
 * @param  {String} dir     The destination directory
 * @param  {Object} options
 * @param  {String} options.cache For how long a cached version of module should be returned after change
 * @param  {String} options.emitter Event emmiter that should be used by hotLoad.
 * @param  {String} options.event Event to watch for hotLoading
 * @return {module}         Returns cache-less version of module
 */
function hotLoad(dirname, dir, options) {
    if (!options) options = {};
    if (typeof options.cache === 'undefined') options.cache = 5000;
    if (!options.cache) options.cache = 0;
    var modulePath = path.resolve(dirname, dir),
        time;

    if (methods[modulePath]) {
        methods[modulePath].watchTime = Date.now();
    } else {
        methods[modulePath] = {
            watchTime: Date.now()
        };
    }
    time = methods[modulePath].lastChangeTime ?
        methods[modulePath].watchTime - methods[modulePath].lastChangeTime :
        0;

    if (!methods[modulePath].lastChangeTime || time > options.cache) {
        methods[modulePath].lastChangeTime = Date.now();
    }

    if (time > 0 && time <= options.cache && methods[modulePath].method) {
        return methods[modulePath].method;
    } else {
        delete require.cache[modulePath];
        methods[modulePath].method = require(modulePath);
        return methods[modulePath].method;
    }

}

function reloadOnEvent(dirname, dir, options) {
    options.emitter.on(options.event, hotLoad(dirname, dir, options));
}


module.exports = {
    hotLoad: hotLoad,
    eventLoad: reloadOnEvent
};