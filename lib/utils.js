'use strict';

var utils = {};
var proj4 = require('proj4');

proj4.defs("GK4", "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m");

utils.WGS84toGK4 = function WGS84toGK4(lat, lng) {
    return proj4("WGS84", "GK4", [lng, lat]).map(Math.round);
};

utils.GK4toWGS84 = function GK4toWGS84(lat, lng) {
    return proj4("GK4", "WGS84", [lng, lat]).reverse();
};

utils.stripSpaces = function stripSpaces(s) {
    return s.replace(/ /g, '');
};

utils.convertCoordinates = function convertCoordinates(s) {
    var gk4_coords = s.split('|');

    var coords = [];

    for (var i = 1, len = gk4_coords.length - 1; i < len; i++) {
        coords.push(utils.GK4toWGS84(gk4_coords[i++], gk4_coords[i]));
    }

    return coords;
};

utils.parseDate = function parseDate(d) {
    return new Date(parseInt(d.match(/\d+/)[0]));
};

utils.parseDiva = function parseDiva(d) {
    return d && d.Number ? {number: parseInt(d.Number), network: d.Network} : undefined;
};

utils.parsePlatform = function parsePlatform(p) {
    return p ? {name: p.Name, type: p.Type} : undefined;
};

utils.parsePin = function parsePin(dataAsString, pinType) {
    var data = dataAsString.split('|');
    var coords = utils.GK4toWGS84(data[4], data[5]);

    if (pinType === 'platform') {
        return {
            name: data[3],
            coords: coords,
            platform_nr: data[6]
        };
    } else if (pinType == 'poi' || pinType == 'rentabike' || pinType == 'ticketmachine' || pinType == 'carsharing' || pinType == 'parkandride') {
        return {
            id: data[0],
            name: data[3],
            coords: coords
        };
    }

    // 'stop' id default
    return {
        id: data[0],
        name: data[3],
        coords: coords,
        connections: parseConnections(data[7])
    };
};

utils.parseMot = function parseMode(name) {
    name = name.toLowerCase();

    switch (name) {
        case 'tram':
            return {
                title: "Straßenbahn",
                name: "Tram",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-tram.svg"
            };
        case 'bus':
        case 'citybus':
        case 'intercitybus':
            return {
                title: "Bus",
                name: "Bus",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
            };
        case 'suburbanrailway':
            return {
                title: "S-Bahn",
                name: "SuburbanRailway",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg"
            };
        case 'train':
        case 'rapidtransit':
            return {
                title: "Zug",
                name: "Train",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-train.svg"
            };
        case 'footpath':
            return {
                title: 'Fussweg',
                name: 'Footpath',
                icon_url: 'https://m.dvb.de/img/walk.svg'
            };
        case 'cableway':
        case 'overheadrailway':
            return {
                title: "Seil-/Schwebebahn",
                name: "Cableway",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-lift.svg"
            };
        case 'ferry':
            return {
                title: "Fähre",
                name: "Ferry",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg"
            };
        case 'hailedsharedtaxi':
            return {
                title: "Anrufsammeltaxi (AST)/ Rufbus",
                name: "HailedSharedTaxi",
                icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-alita.svg"
            };
        case 'mobilitystairsup':
            return {
                title: "Treppe aufwärts",
                name: "StairsUp",
                icon_url: "https://m.dvb.de/img/stairs-up.svg"
            };
        case 'mobilitystairsdown':
            return {
                title: "Treppe abwärts",
                name: "StairsDown",
                icon_url: "https://m.dvb.de/img/stairs-down.svg"
            };
        case 'mobilityescalatorup':
            return {
                title: "Rolltreppe aufwärts",
                name: "EscalatorUp",
                icon_url: "https://m.dvb.de/img/escalator-up.svg"
            };
        case 'mobilityescalatordown':
            return {
                title: "Rolltreppe abwärts",
                name: "EscalatorDown",
                icon_url: "https://m.dvb.de/img/escalator-down.svg"
            };
        case 'mobilityelevatorup':
            return {
                title: "Fahrstuhl aufwärts",
                name: "ElevatorUp",
                icon_url: "https://m.dvb.de/img/elevator-up.svg"
            };
        case 'mobilityelevatordown':
            return {
                title: "Fahrstuhl abwärts",
                name: "ElevatorDown",
                icon_url: "https://m.dvb.de/img/elevator-down.svg"
            };
    }
};

function parseConnections(data) {
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

module.exports = utils;
