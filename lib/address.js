'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var address = function address(lat, lng, callback) {
    var options = {
        url: 'https://www.dvb.de/apps/map/address',
        qs: {
            lat: lat,
            lng: lng
        }
    };

    return requestP(options)
        .then(function (data) {
            data.slice(1, data.length).split('|');
            return {
                city: data[0],
                address: data[1]
            };
        }).nodeify(callback);
};

module.exports = address;
