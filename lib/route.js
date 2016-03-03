'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var url = process.env.EDUROAM != undefined ? 'http://efa.faplino.de/dvb/XML_TRIP_REQUEST2' : 'http://efa.vvo-online.de:8080/dvb/XML_TRIP_REQUEST2';

var route = function route(origin, destination, time, deparr, callback) {
    origin = utils.stripSpaces(origin);
    destination = utils.stripSpaces(destination);

    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var day = time.getDate();
    var hour = time.getHours();
    var minute = time.getMinutes();

    if (month < 10) {
        month = '0' + month;
    }

    if (deparr !== route.DEPARTURE && deparr !== route.ARRIVAL) {
        deparr = route.ARRIVAL;
    }

    // API docs: http://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/LINZ_LINIEN_Schnittstelle_EFA_V1.pdf
    // found here -> http://www.nise81.com/archives/2674
    var options = {
        url: url,
        qs: {
            sessionID: '0',
            requestID: '0',
            language: 'de',
            execInst: 'normal',
            command: '',
            ptOptionsActive: '-1',
            itOptionsActive: '',
            itDateDay: day,
            itDateMonth: month,
            itDateYear: year,
            place_origin: 'Dresden',
            placeState_origin: 'empty',
            type_origin: 'stop',
            name_origin: origin,
            nameState_origin: 'empty',
            place_destination: 'Dresden',
            placeState_destination: 'empty',
            type_destination: 'stop',
            name_destination: destination,
            nameState_destination: 'empty',
            itdTripDateTimeDepArr: deparr,
            itdTimeHour: hour,
            idtTimeMinute: minute,
            outputFormat: 'JSON',
            coordOutputFormat: 'WGS84[DD.ddddd]',
            coordOutputFormatTail: 9
        }
    };

    return requestP(options)
        .then(function (data) {
            // fixes json error
            data = data.replace(/,(\s+),/g, ',');
            return JSON.parse(data);
        })
        .then(function (data) {
            if (!data.trips) {
                return null;
            }

            return {
                origin: data.origin.points.point.name,
                destination: data.destination.points.point.name,
                trips: data.trips.map(extractTrip)
            };
        }).nodeify(callback);
};

function extractTrip(trip) {
    var departure = trip.legs[0].points[0].dateTime.time;
    var arrival = trip.legs[trip.legs.length - 1].points[trip.legs[trip.legs.length - 1].points.length - 1].dateTime.time;
    var duration = trip.duration;
    var interchange = parseInt(trip.interchange);

    return {
        departure: departure,
        arrival: arrival,
        duration: duration,
        interchange: interchange,
        nodes: trip.legs.map(function (leg) {
            var mode = leg.mode.product;
            var line = leg.mode.number;
            var direction = leg.mode.destination;
            var path = leg.path ? leg.path.split(' ').map(utils.convertCoordinates) : [];

            var departure = {
                stop: leg.points[0].nameWO,
                time: leg.points[0].dateTime.time,
                coords: utils.convertCoordinates(leg.points[0].ref.coords)
            };

            var arrival = {
                stop: leg.points[1].nameWO,
                time: leg.points[1].dateTime.time,
                coords: utils.convertCoordinates(leg.points[1].ref.coords)
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

route.DEPARTURE = 'dep';
route.ARRIVAL = 'arr';

module.exports = route;
