'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var monitor = function monitor(stop, offset, amount, callback) {
    // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
    stop = utils.stripSpaces(stop);

    // hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
    // vz = time offset from now; trims the beginning of the array
    // lim = limit the amount of results, max seems to be 31
    // var url = 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=' + offset + '&lim=' + amount;
    var options = {
        url: 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do',
        qs: {
            hst: stop,
            vz: offset,
            lim: amount
        }
    };

    var now = new Date();

    return requestP(options)
        .then(JSON.parse)
        .map(function (transport) {
            var arrivalTimeRelative = parseInt(transport[2]) || 0;
            return {
                line: transport[0],
                direction: transport[1],
                arrivalTimeRelative: arrivalTimeRelative,
                arrivalTime: new Date(now.getTime() + 60000 * arrivalTimeRelative),
                mode: utils.parseMode(transport[0])
            };
        }).nodeify(callback);
};

module.exports = monitor;
