'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var coords = function coords(id, callback) {
    var options = {
        url: 'https://www.dvb.de/apps/map/coordinates',
        qs: {
            id: id
        }
    };

    return requestP(options)
        .then(function (data) {
            if (data.length < 3) {
                return null;
            }

            var coords = data.slice(1, data.length - 1).split('|');
            return utils.GK4toWGS84(coords[0], coords[1]);
        }).nodeify(callback);
};

module.exports = coords;
