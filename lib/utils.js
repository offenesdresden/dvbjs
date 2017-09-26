'use strict';

var utils = {};
var proj4 = require('proj4');

proj4.defs("GK4", "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m");

utils.WGS84toGK4 = function WGS84toGK4(lat, lng) {
    return proj4("WGS84", "GK4", [lng, lat]).map(Math.round);
};

utils.GK4toWGS84 = function GK4toWGS84(lat, lng) {
    lat = parseInt(lat);
    lng = parseInt(lng);

    if (lat === 0 && lng === 0)
        return [undefined, undefined];

    return proj4("GK4", "WGS84", [lng, lat]).reverse();
};

utils.convertCoordinates = function convertCoordinates(s) {
    var coords = [];

    if (s) {
        var gk4_coords = s.split('|');

        for (var i = 1, len = gk4_coords.length - 1; i < len; i++) {
            coords.push(utils.GK4toWGS84(gk4_coords[i++], gk4_coords[i]));
        }
    }

    return coords;
};


utils.checkStatus = function checkStatus(data) {
    if (!data || !data.Status)
        throw new Error('unexpected error');
    if (data.Status.Code !== 'Ok') {
        var error = new Error(data.Status.Message);
        error.name = data.Status.Code;
        throw error;
    }
};

utils.constructError = function constructError(name, message) {
    var error = new Error(message);
    if (name)
        error.name = name;
    return error;
};

utils.convertError = function convertError(err) {
    if (err.error && err.error.Status && err.error.Status) {
        throw utils.constructError(err.error.Status.Code, err.error.Status.Message);
    }
    throw err;
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
    } else if (pinType === 'poi' || pinType === 'rentabike' || pinType === 'ticketmachine' || pinType === 'carsharing' || pinType === 'parkandride') {
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
    switch (name.toLowerCase()) {
        case 'tram':
            return utils.MODES.Tram;
        case 'bus':
        case 'citybus':
        case 'intercitybus':
            return utils.MODES.Bus;
        case 'suburbanrailway':
            return utils.MODES.SuburbanRailway;
        case 'train':
        case 'rapidtransit':
            return utils.MODES.Train;
        case 'footpath':
            return utils.MODES.Footpath;
        case 'cableway':
        case 'overheadrailway':
            return utils.MODES.Cableway;
        case 'ferry':
            return utils.MODES.Ferry;
        case 'hailedsharedtaxi':
            return utils.MODES.HailedSharedTaxi;
        case 'mobilitystairsup':
            return utils.MODES.StairsUp;
        case 'mobilitystairsdown':
            return utils.MODES.StairsDown;
        case 'mobilityescalatorup':
            return utils.MODES.EscalatorUp;
        case 'mobilityescalatordown':
            return utils.MODES.EscalatorDown;
        case 'mobilityelevatorup':
            return utils.MODES.ElevatorUp;
        case 'mobilityelevatordown':
            return utils.MODES.ElevatorDown;
        case 'stayforconnection':
            return utils.MODES.StayForConnection;
        default:
            return {
                title: name.toLowerCase(),
                name: name
            }
    }
};

utils.parsePoiID = function parsePoiID(id) {
    var poi_id = id.split(":");

    if (poi_id.length >= 4) {
        poi_id = poi_id.slice(0, 4);

        switch (poi_id[0]) {
            case"streetID":
                return {
                    id: poi_id.join(':'),
                    type: utils.POI_TYPE.ADDRESS
                };
            case"coord":
                return {
                    id: poi_id.join(':'),
                    type: utils.POI_TYPE.COORDS
                };
            case"poiID":
                return {
                    id: poi_id.join(':'),
                    type: utils.POI_TYPE.POI
                };
        }
    }
    return {
        id: id,
        type: utils.POI_TYPE.STOP
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

utils.MODES = {
    Tram: {
        title: "Straßenbahn",
        name: "Tram",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-tram.svg"
    },
    Bus: {
        title: "Bus",
        name: "Bus",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-bus.svg"
    },
    SuburbanRailway: {
        title: "S-Bahn",
        name: "SuburbanRailway",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg"
    },
    Train: {
        title: "Zug",
        name: "Train",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-train.svg"
    },
    Cableway: {
        title: "Seil-/Schwebebahn",
        name: "Cableway",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-lift.svg"
    },
    Ferry: {
        title: "Fähre",
        name: "Ferry",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg"
    },
    HailedSharedTaxi: {
        title: "Anrufsammeltaxi (AST)/ Rufbus",
        name: "HailedSharedTaxi",
        icon_url: "https://www.dvb.de/assets/img/trans-icon/transport-alita.svg"

    },
    Footpath: {
        title: 'Fussweg',
        name: 'Footpath',
        icon_url: 'https://m.dvb.de/img/walk.svg'
    },
    StairsUp: {
        title: "Treppe aufwärts",
        name: "StairsUp",
        icon_url: "https://m.dvb.de/img/stairs-up.svg"
    },
    StairsDown: {
        title: "Treppe abwärts",
        name: "StairsDown",
        icon_url: "https://m.dvb.de/img/stairs-down.svg"
    },
    EscalatorUp: {
        title: "Rolltreppe aufwärts",
        name: "EscalatorUp",
        icon_url: "https://m.dvb.de/img/escalator-up.svg"
    },
    EscalatorDown: {
        title: "Rolltreppe abwärts",
        name: "EscalatorDown",
        icon_url: "https://m.dvb.de/img/escalator-down.svg"
    },
    ElevatorUp: {
        title: "Fahrstuhl aufwärts",
        name: "ElevatorUp",
        icon_url: "https://m.dvb.de/img/elevator-up.svg"
    },
    ElevatorDown: {
        title: "Fahrstuhl abwärts",
        name: "ElevatorDown",
        icon_url: "https://m.dvb.de/img/elevator-down.svg"
    },
    StayForConnection: {
        title: "gesicherter Anschluss",
        name: "StayForConnection",
        icon_url: "https://m.dvb.de/img/sit.svg"
    }
};

utils.POI_TYPE = {
    ADDRESS: 'Address',
    COORDS: 'Coords',
    POI: 'POI',
    STOP: 'Stop'
};

module.exports = utils;
