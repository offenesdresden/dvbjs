'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var pins = function pins(swlat, swlng, nelat, nelng, pinType, callback) {
    var sw = utils.WGS84toGK4(swlat, swlng);
    var ne = utils.WGS84toGK4(nelat, nelng);

    var options = {
        url: 'https://www.dvb.de/apps/map/pins',
        qs: {
            showLines: 'true',
            swlat: sw[1],
            swlng: sw[0],
            nelat: ne[1],
            nelng: ne[0],
            pintypes: pinType
        }
    };

    return requestP(options)
        .then(function (data) {
            if (!data) {
                return [];
            }
            //Create an array out of the string response by splitting between each: ","
            //Drop the first two characters: " and [
            //and the last last two characters: ] and "
            return data.slice(2, data.length - 2).split('\",\"');
        })
        .map(function (elem) {
            return utils.parsePin(elem, pinType);
        }).nodeify(callback);
};

pins.type = {
    STOP: 'stop',
    PLATFORM: 'platform',
    POI: 'poi',
    RENT_A_BIKE: 'rentabike',
    TICKET_MACHINE: 'ticketmachine',
    CAR_SHARING: 'carsharing',
    PARK_AND_RIDE: 'parkandride'
};

module.exports = pins;
