'use strict';

var requestP = require('request-promise');
var _ = require('lodash');
var utils = require('./utils');

var pins = function pins(swlat, swlng, nelat, nelng, pinTypes, callback) {
    var sw = utils.WGS84toGK4(swlat, swlng);
    var ne = utils.WGS84toGK4(nelat, nelng);

    pinTypes = Array.isArray(pinTypes) ? pinTypes.join("&pintypes=") : pinTypes;
    var uri = 'https://www.dvb.de/apps/map/pins?showLines=true&swlat=' + sw[1] + '&swlng=' + sw[0] + '&nelat=' + ne[1] + '&nelng=' + ne[0] + '&pintypes=' + pinTypes;

    return requestP(uri)
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
            return parsePin(elem);
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

function parsePin(dataAsString) {
    var data = dataAsString.split('|');
    var coords = utils.GK4toWGS84(data[4], data[5]);
    var pinType = parsePinType(data[1]);

    if (pinType === 'platform') {
        return {
            name: data[3],
            coords: coords,
            platform_nr: data[6],
            type: pinType
        };
    } else if (_.contains(['poi', 'rentabike', 'ticketmachine', 'carsharing', 'parkandride'], pinType)) {
        return {
            id: data[0],
            name: data[3],
            coords: coords,
            type: pinType
        };
    }

    // 'stop' id default
    return {
        id: data[0],
        name: data[3],
        coords: coords,
        connections: parseConnections(data[7]),
        type: pinType
    };
}

function parsePinType(pinID) {
    switch (pinID) {
        case "t":
            return pins.type.TICKET_MACHINE;
        case "pf":
            return pins.type.PLATFORM;
        case "c":
            return pins.type.CAR_SHARING;
        case "r":
            return pins.type.RENT_A_BIKE;
        case "pr":
            return pins.type.PARK_AND_RIDE;
        case "p":
            return pins.type.POI;
        default:
            return pins.type.STOP;
    }
}

function parseConnections(data) {
    if (!data) return [];

    var connections = [];

    data.split('#').forEach(function (types) {
        types = types.split(":");
        connections = connections.concat(types[1].split("~").map(function (line) {
            return {
                line: line,
                type: types[0]
            }
        }));
    });

    return connections;
}

module.exports = pins;
