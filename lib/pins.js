'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var pins = function pins(swlat, swlng, nelat, nelng, pinType, callback) {
    var options = {
        url: 'https://www.dvb.de/apps/map/pins',
        qs: {
            showLines: 'true',
            swlat: swlat,
            swlng: swlng,
            nelat: nelat,
            nelng: nelng,
            pintypes: pinType
        }
    };

    return requestP(options)
        .then(function (data) {
            //Create an array out of the string response by splitting between each: ","
            //Drop the first two characters: " and [
            //and the last last two characters: ] and "
            return data.slice(2, data.length - 2).split('\",\"');
        })
        .map(function(elem) {
            return utils.parsePin(elem, pinType);
        }).nodeify(callback);
};

module.exports = pins;