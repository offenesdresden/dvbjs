'use strict';

var _ = require('lodash');
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

//utils.isDresden = function isDresden(point) {
//    return 'Dresden' === point.ref.place;
//};

utils.convertCoordinates = function convertCoordinates(s) {
    return s.split(',').map(parseFloat).reverse();
};

utils.convertStop = function convertStop(point) {
    return {
        stop: point.name.replace('Dresden, ', ''),
        id: point.stateless,
        coords: utils.convertCoordinates(point.ref.coords)
    };
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
    } else if (_.contains(['poi', 'rentabike', 'ticketmachine', 'carsharing', 'parkandride'], pinType)) {
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

utils.parseMode = function parseMode(id) {
    if (parseInt(id) != undefined) {
        var intID = parseInt(id);
        if (between(intID, 0, 59)) return utils.modes['tram'];
        if (between(intID, 60, 99)) return utils.modes['citybus'];
        if (between(intID, 100, 1000)) return utils.modes['regiobus'];
    }
    if (id === 'SWB' || id === 'STB') return utils.modes['lift'];

    if (matches(id, /^E\d+/)) {
        var match = id.match(/^E(\d+)/);
        if (match[1] <= 59) return utils.modes['tram'];
        else return utils.modes['citybus'];
    }

    if (matches(id, /^\D$|^\D\/\D$/)) return utils.modes['regiobus'];
    if (matches(id, /^F/)) return utils.modes['ferry'];
    if (matches(id, /^RE|^IC|^TL|^RB|^SB|^SE|^U\d/)) return utils.modes['train'];
    if (matches(id, /^S/)) return utils.modes['metropolitan'];
    if (matches(id, /alita/)) return utils.modes['ast'];

    return null;
}

utils.modes = {
    'tram': {
        title: "Straßenbahn",
        name: "tram",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-tram.svg"
    },
    'citybus': {
        title: "Stadtbus",
        name: "citybus",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
    },
    'regiobus': {
        title: "Regionalbus",
        name: "regiobus",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
    },
    'metropolitan': {
        title: "S-Bahn",
        name: "metropolitan",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg"
    },
    'lift': {
        title: "Seil-/Schwebebahn",
        name: "lift",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-lift.svg"
    },
    'ferry': {
        title: "Fähre",
        name: "ferry",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg"
    },
    'ast': {
        title: "Anrufsammeltaxi (AST)/ Rufbus",
        name: "ast",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-alita.svg"
    },
    'train': {
        title: "Zug",
        name: "train",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-train.svg"
    }
};

function between(val, min, max) {
    return val >= min && val <= max;
}

function matches(val, regex) {
    var matches = val.match(regex);
    return matches != undefined && matches.length > 0;
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

module.exports = utils;
