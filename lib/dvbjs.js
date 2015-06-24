'use strict';

var request = require('request');
var dvb = {};

dvb.monitor = function(stop, offset, amount, callback) {

    // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
    stop = stripSpaces(stop);

    // hst = name of bus- or tramstop, e.g. 'Helmholtzstraße'
    // vz = time offset from now; trims the beginning of the array
    // lim = limit the amount of results, max seems to be 31
    var url = 'http://widgets.vvo-online.de/abfahrtsmonitor/Abfahrten.do?hst=' + stop + '&vz=' + offset + '&lim=' + amount;

    request(url, function(err, res, data) {
        if (err) return callback(err);

        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        var json = data.map(function (transport) {
            return {
                line: transport[0],
                direction: transport[1],
                arrivaltime: parseInt(transport[2]) || 0
            };
        });

        callback(null, json);
    });
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
    var url = 'http://efa.vvo-online.de:8080/dvb/XML_TRIP_REQUEST2?sessionID=0&requestID=0&language=de&execInst=normal&command=&ptOptionsActive=-1&itOptionsActive=&itDateDay=' + day + '&itDateMonth=' + month + '&itDateYear=' + year + '&place_origin=Dresden&placeState_origin=empty&type_origin=stop&name_origin=' + origin + '&nameState_origin=empty&place_destination=Dresden&placeState_destination=empty&type_destination=stop&name_destination=' + destination + '&nameState_destination=empty&itdTripDateTimeDepArr=' + deparr + '&itdTimeHour=' + hour + '&idtTimeMinute=' + minute + '&outputFormat=JSON&coordOutputFormat=WGS84&coordOutputFormatTail=0';
    request(url, function(err, res, data) {
        if (err) return callback(err);

        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        var json = {
            origin: data.origin.points.point.name,
            destination: data.destination.points.point.name
        };

        // iterate over all trips for this route
        json.trips = data.trips.map(function (tripData) {
            var departure   = tripData.legs[0].points[0].dateTime.time;
            var arrival     = tripData.legs[tripData.legs.length - 1].points[tripData.legs[tripData.legs.length - 1].points.length - 1].dateTime.time;
            var duration    = tripData.duration;
            var interchange = parseInt(tripData.interchange);

            var trip = {
                departure: departure,
                arrival: arrival,
                duration: duration,
                interchange: interchange,
            };

            // iterate over the single elements of this route (e.g. bus -> tram -> bus -> on foot etc.)
            trip.nodes = tripData.legs.map(function (nodeData) {
                var mode = nodeData.mode.product;
                var line = nodeData.mode.number;
                var direction = nodeData.mode.destination;
                var path = [];

                if (nodeData.path) {
                    path = nodeData.path.split(' ').map(convertCoords);
                }

                var departure = {
                    stop: nodeData.points[0].nameWO,
                    time: nodeData.points[0].dateTime.time,
                    coords: convertCoords(nodeData.points[0].ref.coords)
                };

                var arrival = {
                    stop: nodeData.points[1].nameWO,
                    time: nodeData.points[1].dateTime.time,
                    coords: convertCoords(nodeData.points[1].ref.coords)
                };

                return {
                    mode: mode,
                    line: line,
                    direction: direction,
                    departure: departure,
                    arrival: arrival,
                    path: path
                };
            });

            return trip;
        })

        callback(null, json);
    });
};

dvb.route.DEPARTURE = 'dep';
dvb.route.ARRIVAL = 'arr';

dvb.find = function(searchString, callback) {

    searchString = stripSpaces(searchString);

    // for coordinates see this as well: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_AG_LINIEN_Schnittstelle_EFA_Koordinaten.pdf
    var url = 'http://efa.vvo-online.de:8080/dvb/XML_STOPFINDER_REQUEST?locationServerActive=1&outputFormat=JSON&type_sf=any&name_sf=' + searchString + '&coordOutputFormat=WGS84&coordOutputFormatTail=0';

    request(url, function(err, res, data) {
        if (err) return callback(err);

        try {
            var points = JSON.parse(data).stopFinder.points;
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

function isDresden(point) {
    return point.posttown === 'Dresden';
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
