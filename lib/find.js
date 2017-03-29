'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

function pointFinder(name, stopsOnly, assignedStops) {
    // remove whitespace
    var stopName = name.trim();

    var options = {
        url: 'https://webapi.vvo-online.de/tr/pointfinder?format=json',
        qs: {
            limit: 0,
            query: stopName,
            stopsOnly: stopsOnly,
            assignedStops: assignedStops,
            dvb: true
        },
        json: true
    };

    return requestP(options)
        .then(function (data) {

            // check status
            if (data.Status &&
                data.Status.Code === 'Ok' &&
                data.Points) {

                return data.Points.map(function (p) {
                    p = p.split('|');

                    var city = p[2] === "" ? "Dresden" : p[2];
                    var idAndType = utils.parsePoiID(p[0]);

                    return {
                        name: p[3].replace(/'/g, ""),
                        id: idAndType.id,
                        city: city,
                        coords: utils.GK4toWGS84(p[4], p[5]),
                        type: idAndType.type
                    };
                }).filter(function (p) {
                    return p.name;
                })
            }

            return [];
        })
}

module.exports = {
    findStop: function findStop(searchString, callback) {
        return pointFinder(searchString, true, false).nodeify(callback);
    },
    findPOI: function findPOI(searchString, callback) {
        return pointFinder(searchString, false, false).nodeify(callback);
    },
    findAddress: function findAddress(lat, lng, callback) {
        var gk4 = utils.WGS84toGK4(lat, lng);
        return pointFinder('coord:' + gk4[0] + ':' + gk4[1], false, true)
            .then(function (points) {
                var length = points.length;

                if (length === 0) {
                    return null;
                }

                var addrss = points[0];
                addrss.stops = [];

                for (var i = 1; i < length; i++) {
                    addrss.stops.push(points[i]);
                }
                return addrss;
            }).nodeify(callback);
    }
};
