'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var address = function address(lat, lng, callback) {
    var coords = utils.WGS84toGK4(lat, lng);
    var options = {
        url: 'https://www.dvb.de/apps/map/address',
        qs: {
            lat: coords[1],
            lng: coords[0]
        }
    };

    return requestP(options)
        .then(function (data) {
            if (data.length < 3) {
                return null;
            }

            data = data.slice(1, data.length - 1).split('|');
            return {
                city: data[0],
                address: data[1]
            };
        }).nodeify(callback);
};

module.exports = address;
