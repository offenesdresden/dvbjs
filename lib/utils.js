"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var proj4 = require("proj4");
var interfaces_1 = require("./interfaces");
proj4.defs('GK4', '+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m');
function wgs84toGk4(lat, lng) {
    return proj4('WGS84', 'GK4').forward([Number(lng), Number(lat)]).map(Math.round);
}
exports.wgs84toGk4 = wgs84toGk4;
function gk4toWgs84(lat, lng) {
    var latInt = parseInt(lat, 10);
    var lngInt = parseInt(lng, 10);
    if (latInt === 0 && lngInt === 0) {
        return [undefined, undefined];
    }
    if (isNaN(latInt) || isNaN(lngInt)) {
        return [undefined, undefined];
    }
    return proj4('GK4', 'WGS84').forward([lngInt, latInt]).reverse();
}
exports.gk4toWgs84 = gk4toWgs84;
function convertCoordinates(s) {
    var coords = [];
    if (s) {
        var gk4Chords = s.split('|');
        var i = 1;
        var len = gk4Chords.length - 1;
        while (i < len) {
            coords.push(gk4toWgs84(gk4Chords[i], gk4Chords[i + 1]));
            i += 2;
        }
    }
    return coords;
}
exports.convertCoordinates = convertCoordinates;
function checkStatus(data) {
    if (!data || !data.Status) {
        throw new Error('unexpected error');
    }
    if (data.Status.Code !== 'Ok') {
        var error = new Error(data.Status.Message);
        error.name = data.Status.Code;
        throw error;
    }
}
exports.checkStatus = checkStatus;
function constructError(name, message) {
    var error = new Error(message);
    if (name) {
        error.name = name;
    }
    return error;
}
exports.constructError = constructError;
function convertError(err) {
    if (err.error && err.error.Status && err.error.Status) {
        throw constructError(err.error.Status.Code, err.error.Status.Message);
    }
    throw err;
}
exports.convertError = convertError;
function parseDate(d) {
    return new Date(parseInt(d.match(/\d+/)[0], 10));
}
exports.parseDate = parseDate;
function parseDiva(d) {
    return d && d.Number ? { number: parseInt(d.Number, 10), network: d.Network } : undefined;
}
exports.parseDiva = parseDiva;
function parsePlatform(p) {
    return p ? { name: p.Name, type: p.Type } : undefined;
}
exports.parsePlatform = parsePlatform;
function parsePin(dataAsString, pinType) {
    var data = dataAsString.split('|');
    var coords = gk4toWgs84(data[4], data[5]);
    if (pinType === interfaces_1.PIN_TYPE.PLATFORM) {
        return {
            coords: coords,
            name: data[3],
            platform_nr: data[6],
        };
    }
    if (pinType === interfaces_1.PIN_TYPE.POI || pinType === interfaces_1.PIN_TYPE.RENT_A_BIKE
        || pinType === interfaces_1.PIN_TYPE.TICKET_MACHINE || pinType === interfaces_1.PIN_TYPE.CAR_SHARING
        || pinType === interfaces_1.PIN_TYPE.PARK_AND_RIDE) {
        return {
            coords: coords,
            id: data[0],
            name: data[3],
        };
    }
    // 'stop' id default
    return {
        coords: coords,
        id: data[0],
        name: data[3],
        connections: parseConnections(data[7]),
    };
}
exports.parsePin = parsePin;
function parseMode(name) {
    switch (name.toLowerCase()) {
        case 'tram':
            return exports.MODES.Tram;
        case 'bus':
        case 'citybus':
        case 'intercitybus':
            return exports.MODES.Bus;
        case 'suburbanrailway':
            return exports.MODES.SuburbanRailway;
        case 'train':
        case 'rapidtransit':
            return exports.MODES.Train;
        case 'footpath':
            return exports.MODES.Footpath;
        case 'cableway':
        case 'overheadrailway':
            return exports.MODES.Cableway;
        case 'ferry':
            return exports.MODES.Ferry;
        case 'hailedsharedtaxi':
            return exports.MODES.HailedSharedTaxi;
        case 'mobilitystairsup':
            return exports.MODES.StairsUp;
        case 'mobilitystairsdown':
            return exports.MODES.StairsDown;
        case 'mobilityescalatorup':
            return exports.MODES.EscalatorUp;
        case 'mobilityescalatordown':
            return exports.MODES.EscalatorDown;
        case 'mobilityelevatorup':
            return exports.MODES.ElevatorUp;
        case 'mobilityelevatordown':
            return exports.MODES.ElevatorDown;
        case 'stayforconnection':
            return exports.MODES.StayForConnection;
        default:
            return {
                name: name,
                title: name.toLowerCase(),
            };
    }
}
exports.parseMode = parseMode;
function parsePoiID(id) {
    var poiId = id.split(':');
    if (poiId.length >= 4) {
        poiId = poiId.slice(0, 4);
        switch (poiId[0]) {
            case 'streetID':
                return {
                    id: poiId.join(':'),
                    type: interfaces_1.POI_TYPE.ADDRESS,
                };
            case 'coord':
                return {
                    id: poiId.join(':'),
                    type: interfaces_1.POI_TYPE.COORDS,
                };
            case 'poiID':
                return {
                    id: poiId.join(':'),
                    type: interfaces_1.POI_TYPE.POI,
                };
        }
    }
    return {
        id: id,
        type: interfaces_1.POI_TYPE.STOP,
    };
}
exports.parsePoiID = parsePoiID;
function parseConnections(data) {
    var connections = [];
    data.split('#').forEach(function (types) {
        var typesArray = types.split(':');
        connections = connections.concat(typesArray[1].split('~').map(function (line) { return ({
            line: line,
            type: typesArray[0],
        }); }));
    });
    return connections;
}
exports.MODES = {
    Tram: {
        title: 'Straßenbahn',
        name: 'Tram',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg',
    },
    Bus: {
        title: 'Bus',
        name: 'Bus',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
    },
    SuburbanRailway: {
        title: 'S-Bahn',
        name: 'SuburbanRailway',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg',
    },
    Train: {
        title: 'Zug',
        name: 'Train',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-train.svg',
    },
    Cableway: {
        title: 'Seil-/Schwebebahn',
        name: 'Cableway',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-lift.svg',
    },
    Ferry: {
        title: 'Fähre',
        name: 'Ferry',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg',
    },
    HailedSharedTaxi: {
        title: 'Anrufsammeltaxi (AST)/ Rufbus',
        name: 'HailedSharedTaxi',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-alita.svg',
    },
    Footpath: {
        title: 'Fussweg',
        name: 'Footpath',
        icon_url: 'https://m.dvb.de/img/walk.svg',
    },
    StairsUp: {
        title: 'Treppe aufwärts',
        name: 'StairsUp',
        icon_url: 'https://m.dvb.de/img/stairs-up.svg',
    },
    StairsDown: {
        title: 'Treppe abwärts',
        name: 'StairsDown',
        icon_url: 'https://m.dvb.de/img/stairs-down.svg',
    },
    EscalatorUp: {
        title: 'Rolltreppe aufwärts',
        name: 'EscalatorUp',
        icon_url: 'https://m.dvb.de/img/escalator-up.svg',
    },
    EscalatorDown: {
        title: 'Rolltreppe abwärts',
        name: 'EscalatorDown',
        icon_url: 'https://m.dvb.de/img/escalator-down.svg',
    },
    ElevatorUp: {
        title: 'Fahrstuhl aufwärts',
        name: 'ElevatorUp',
        icon_url: 'https://m.dvb.de/img/elevator-up.svg',
    },
    ElevatorDown: {
        title: 'Fahrstuhl abwärts',
        name: 'ElevatorDown',
        icon_url: 'https://m.dvb.de/img/elevator-down.svg',
    },
    StayForConnection: {
        title: 'gesicherter Anschluss',
        name: 'StayForConnection',
        icon_url: 'https://m.dvb.de/img/sit.svg',
    },
};
//# sourceMappingURL=utils.js.map