'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var coords = function coords(poi, callback) {
    var options = {
        url: 'https://www.dvb.de/apps/map/coordinates',
        qs: {
            id: poi
        }
    };

    return requestP(options)
        .then(function (data) {
            var coords = data.slice(1, data.length - 1).split('|');
            return utils.GK4toWGS84(coords[0], coords[1]);
        }).nodeify(callback);
};

module.exports = coords;
