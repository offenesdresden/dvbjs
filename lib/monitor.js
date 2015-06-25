'use strict';

var request = require('request');
var utils = require('./utils');

var monitor = function monitor(stop, offset, amount, callback) {

    // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
    stop = utils.stripSpaces(stop);

    // hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
    // vz = time offset from now; trims the beginning of the array
    // lim = limit the amount of results, max seems to be 31
    var url = 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=' + offset + '&lim=' + amount;

    request.get(url, function onResponse(err, res, data) {
        if (err) return callback(err);

        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        var now = new Date();
        var result = data.map(function eachTransport(transport) {
            var arrivalTimeRelative = parseInt(transport[2]) || 0;
            return {
                line: transport[0],
                direction: transport[1],
                arrivalTimeRelative: arrivalTimeRelative,
                arrivalTime: new Date(now.getTime() + 1000 * arrivalTimeRelative)
            };
        });

        callback(null, result);
    });
};

module.exports = monitor;
