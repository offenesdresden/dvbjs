'use strict';

var request = require('request');
var requestP = require('request-promise');
var _        = require('lodash');
var dvb = {};

dvb.monitor = function(stop, offset, amount, callback) {

    // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
    stop = stripSpaces(stop);

    // hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
    // vz = time offset from now; trims the beginning of the array
    // lim = limit the amount of results, max seems to be 31
    // var url = 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=' + offset + '&lim=' + amount;
    var options = {
        'url' : 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do',
        'qs' : {
            'hst' : stop,
            'vz' : offset,
            'lim' : amount
        }
    };
    
    return requestP(options)
    .then(JSON.parse)
    .map(function(elem) {
        return {
            line: elem[0],
            direction: elem[1],
            arrivaltime: parseInt(elem[2]) || 0
        };
    }).nodeify(callback);
};

dvb.route = function(origin, destination, time, deparr, callback) {

    origin = stripSpaces(origin);
    destination = stripSpaces(destination);

    var year   = time.getFullYear();
    var month  = time.getMonth() + 1;
    var day    = time.getDate();
    var hour   = time.getHours();
    var minute = time.getMinutes();

    if (month < 10) month = '0' + month;

    if (deparr !== dvb.route.DEPARTURE && deparr !== dvb.route.ARRIVAL) {
        deparr = dvb.route.ARRIVAL;
    }

    // API docs: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_LINIEN_Schnittstelle_EFA_V1.pdf
    // found here -> http://www.nise81.com/archives/2674
    var options = {
        'url' : 'http://efa.vvo-online.de:8080/dvb/XML_TRIP_REQUEST2',
        'qs' : {
            sessionID              : '0',
            requestID              : '0',
            language               : 'de',
            execInst               : 'normal',
            command                : '',
            ptOptionsActive        : '-1',
            itOptionsActive        : '',
            itDateDay              : day,
            itDateMonth            : month,
            itDateYear             : year,
            place_origin           : 'Dresden',
            placeState_origin      : 'empty',
            type_origin            : 'stop',
            name_origin            : origin,
            nameState_origin       : 'empty',
            place_destination      : 'Dresden',
            placeState_destination : 'empty',
            type_destination       : 'stop',
            name_destination       : destination,
            nameState_destination  : 'empty',
            itdTripDateTimeDepArr  : deparr,
            itdTimeHour            : hour,
            idtTimeMinute          : minute,
            outputFormat           : 'JSON',
            coordOutputFormat      : 'WGS84',
            coordOutputFormatTail  : '0'
        }    
    };

    return requestP(options)
    .then(JSON.parse)
    .then(function(data) {
        return {
            origin: data.origin.points.point.name,
            destination: data.destination.points.point.name,
            trips: data.trips.map(extractTrip)
        };
    }).nodeify(callback);
};

function extractTrip(trip) {

    var departure   = trip.legs[0].points[0].dateTime.time;
    var arrival     = trip.legs[trip.legs.length - 1].points[trip.legs[trip.legs.length - 1].points.length - 1].dateTime.time;
    var duration    = trip.duration;
    var interchange = parseInt(trip.interchange);
    return {
        departure: departure,
        arrival: arrival,
        duration: duration,
        interchange: interchange,
        nodes: trip.legs.map(function(leg) {
            
            var mode            = leg.mode.product;
            var line            = leg.mode.number;
            var direction       = leg.mode.destination;
            var path;

            if (leg.path) {
                path = leg.path;
                path = path.split(' ');

                for (var k = 0; k < path.length; k++) {
                    path[k] = convertCoords(path[k]);
                }
            }

            departure = {
                stop: leg.points[0].nameWO,
                time: leg.points[0].dateTime.time,
                coords: convertCoords(leg.points[0].ref.coords)
            };

            arrival = {
                stop: leg.points[1].nameWO,
                time: leg.points[1].dateTime.time,
                coords: convertCoords(leg.points[1].ref.coords)
            };

            return {
                mode: mode,
                line: line,
                direction: direction,
                departure: departure,
                arrival: arrival,
                path: path
            };
        })
    };
}

dvb.route.DEPARTURE = 'dep';
dvb.route.ARRIVAL = 'arr';

dvb.find = function(searchString, callback) {

    searchString = stripSpaces(searchString);

    // for coordinates see this as well: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_AG_LINIEN_Schnittstelle_EFA_Koordinaten.pdf
    var url = 'http://efa.vvo-online.de:8080/dvb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=' + searchString + '&coordOutputFormat=WGS84&coordOutputFormatTail=0';

    request.get(url, function(err, res, data) {
        if (err) return callback(err);

        var points;
        try {
            points = JSON.parse(data).stopFinder.points;
        } catch (e) {
            return callback(err);
        }

        if (!Array.isArray(points)) {
            points = [points.point];
        }

        var json = points.filter(isDresden).map(convertStop);

        callback(null, json);
    });

};

dvb.pins = function pins(swlat, swlng, nelat, nelng, pintypes, callback) {

    var options = {
        'url' : 'https://www.dvb.de/apps/map/pins',
        'qs' : {
            'showLines' : 'true',
            'swlat' : swlat,
            'swlng' : swlng,
            'nelat' : nelat,
            'nelng' : nelng,
            'pintypes' : pintypes
        }
    };
    
    return requestP(options)
    .then(function(data) {
        //Create an array out of the string response by splitting between each: ","
        //Drop the first two characters: " and [ 
        //and the last last two characters: ] and "
        return data.slice(2, data.length-2).split('\",\"');
        
    })
    .map(function(elem) {
        return parsePin(elem, pintypes);
    }).nodeify(callback);
};

dvb.address = function address(lat, lng, callback) {

    var options = {
        'url' : 'https://www.dvb.de/apps/map/address',
        'qs' : {
            'lat' : lat,
            'lng' : lng
        }
    };

    return requestP(options)
    .then(function(data) {
        data.slice(1, data.length).split('|');
        return {
            city: data[0],
            address: data[1]
        };
    }).nodeify(callback);
};

dvb.coords = function coords(poiID, callback) {
   
    var options = {
        'url' : 'https://www.dvb.de/apps/map/coordinates',
        'qs' : {
            'id' : poiID,
        }
    };

    return requestP(options)
    .then(function(data) {
        return data.slice(1, data.length-1).split('|');
    }).nodeify(callback);

};

 function parsePin(dataAsString, pintypes) {
    
    var jsonElem;
    if (pintypes === 'stop') {
        jsonElem = {
            'id' : dataAsString.split('|||')[0],
            'name' : dataAsString.split('||')[1].split('|')[1],
            'coords' : [
                dataAsString.split('||')[1].split('|')[2],
                dataAsString.split('||')[1].split('|')[3]
            ],
            'connections' : dataAsString.split('||')[2]   
        };
        return jsonElem;

    } else if (pintypes === 'platform') {
        jsonElem = {
            'name' : dataAsString.split('||')[1].split('|')[0],
            'coords' : [
                dataAsString.split('||')[1].split('|')[1],
                dataAsString.split('||')[1].split('|')[2]
            ],
            '?' : dataAsString.split('||')[1].split('|')[3]
        };
        return jsonElem;

    } else if (_.contains(['poi', 'rentabike', 'ticketmachine', 'carsharing', 'parkandride'], pintypes)) {
        jsonElem = {
            'id': dataAsString.split('||')[0].split(':')[1]+':'+dataAsString.split('||')[0].split(':')[2],
            'name': dataAsString.split('||')[1].split('|')[0],
            'coords': [
                dataAsString.split('||')[1].split('|')[1],
                dataAsString.split('||')[1].split('|')[2]
            ]
        };
        return jsonElem; 
    }
}

function isDresden(point) {
    return point.mainLoc === 'Dresden';
}

function convertStop(point) {
    return {
        stop: point.object,
        coords: convertCoords(point.ref.coords)
    };
}

function convertCoords(coords) {
    var array = coords.split(',');
    array.reverse();

    for (var i = 0; i < 2; i++) {
        array[i] = parseInt(array[i]) / 1000000;
    }

    return array;
}

function stripSpaces(s) {
    return s.replace(/ /g, '');
}

module.exports = dvb;
