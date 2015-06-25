'use strict';

var request = require('request');
var utils = require('./utils');

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
    var url = 'http://efa.vvo-online.de:8080/dvb/XML_TRIP_REQUEST2?sessionID=0&requestID=0&language=de&execInst=normal&command=&ptOptionsActive=-1&itOptionsActive=&itDateDay=' + day + '&itDateMonth=' + month + '&itDateYear=' + year + '&place_origin=Dresden&placeState_origin=empty&type_origin=stop&name_origin=' + origin + '&nameState_origin=empty&place_destination=Dresden&placeState_destination=empty&type_destination=stop&name_destination=' + destination + '&nameState_destination=empty&itdTripDateTimeDepArr=' + deparr + '&itdTimeHour=' + hour + '&idtTimeMinute=' + minute + '&outputFormat=JSON&coordOutputFormat=WGS84&coordOutputFormatTail=0';

    request.get(url, function onResponse(err, res, data) {
        if (err) return callback(err);

        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        var result = {
            origin: data.origin.points.point.name,
            destination: data.destination.points.point.name
        };

        // iterate over all trips for this route
        result.trips = data.trips.map(function eachTrip(tripData) {
            var trip = {
                departure: tripData.legs[0].points[0].dateTime.time,
                arrival: tripData.legs[tripData.legs.length - 1].points[tripData.legs[tripData.legs.length - 1].points.length - 1].dateTime.time,
                duration: tripData.duration,
                interchange: parseInt(tripData.interchange),
            };

            // iterate over the single elements of this route (e.g. bus -> tram -> bus -> on foot etc.)
            trip.nodes = tripData.legs.map(function eachNode(nodeData) {
                var path = nodeData.path ? nodeData.path.split(' ').map(utils.convertCoordinates) : [];

                return {
                    mode: nodeData.mode.product,
                    line: nodeData.mode.number,
                    direction: nodeData.mode.destination,
                    departure: {
                        stop: nodeData.points[0].nameWO,
                        time: nodeData.points[0].dateTime.time,
                        coords: utils.convertCoordinates(nodeData.points[0].ref.coords)
                    },
                    arrival: {
                        stop: nodeData.points[1].nameWO,
                        time: nodeData.points[1].dateTime.time,
                        coords: utils.convertCoordinates(nodeData.points[1].ref.coords)
                    },
                    path: path
                };
            });

            return trip;
        })

        callback(null, result);
    });
};

route.DEPARTURE = 'dep';
route.ARRIVAL = 'arr';

module.exports = route;
