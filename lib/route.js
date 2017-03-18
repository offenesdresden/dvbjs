'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

var route = function route(origin, destination, time, isarrivaltime, callback) {

    if (time === undefined) {
        time = new Date();
    }

    var options = {
        url: 'https://webapi.vvo-online.de/tr/trips?format=json',
        qs: {
            origin: origin,
            destination: destination,
            isarrivaltime: isarrivaltime === true,
            shorttermchanges: true,
            time: time.toISOString()
        }
    };

    return requestP(options)
        .then(JSON.parse)
        .then(function (data) {
            if (data.Status &&
                data.Status.Code === 'Ok' &&
                data.Routes) {

                var trips = data.Routes.map(extractTrip);

                var origin, destination;

                if (trips && trips.length > 0) {
                    var firstTrip = trips[0];

                    origin = {
                        stop: firstTrip.departure.stop,
                        city: firstTrip.departure.city,
                        coords: firstTrip.departure.coords
                    };
                    destination = {
                        stop: firstTrip.arrival.stop,
                        city: firstTrip.arrival.city,
                        coords: firstTrip.arrival.coords
                    };
                }

                return {
                    origin: origin,
                    destination: destination,
                    trips: trips
                }
            }

            return null;
        }).nodeify(callback);
};

function extractTrip(trip) {

    var nodes = trip.PartialRoutes.map(function (node) {
        return extractNode(node, trip.MapData);
    });

    return {
        departure: nodes[0].departure,
        arrival: nodes[nodes.length - 1].arrival,
        duration: trip.Duration,
        interchanges: trip.Interchanges,
        nodes: nodes
    };
}

function extractNode(node, mapData) {
    var stops = node.RegularStops ? node.RegularStops.map(extractStop) : undefined;

    var departure, arrival;

    if (stops) {
        var firstStop = stops[0];
        var lastStop = stops[stops.length - 1];

        departure = {
            stop: firstStop.stop,
            city: firstStop.city,
            platform: firstStop.platform,
            time: firstStop.departure,
            coords: firstStop.coords
        };

        arrival = {
            stop: lastStop.stop,
            city: lastStop.city,
            platform: firstStop.platform,
            time: lastStop.arrival,
            coords: lastStop.coords
        };
    }

    return {
        mode: utils.parseMot(node.Mot.Type),
        line: node.Mot.Name ? node.Mot.Name : '',
        direction: node.Mot.Direction ? node.Mot.Direction : '',
        diva: utils.parseDiva(node.Mot.Diva),
        duration: node.Duration,
        stops: stops,
        departure: departure,
        arrival: arrival,
        path: utils.convertCoordinates(mapData[node.MapDataIndex])
    };
}

function extractStop(stop) {
    return {
        stop: stop.Name,
        city: stop.Place,
        type: stop.Type,
        platform: utils.parsePlatform(stop.Platform),
        coords: utils.GK4toWGS84(stop.Latitude, stop.Longitude),
        arrival: utils.parseDate(stop.ArrivalTime),
        departure: utils.parseDate(stop.DepartureTime)
    }
}

module.exports = route;
