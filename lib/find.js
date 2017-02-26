'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

function pointFinder(name) {

    // remove whitespace, vvo-online.de handles all kinds of requests pretty nicely
    var stopName = utils.stripSpaces(name);

    var options = {
      url: 'https://webapi.vvo-online.de/tr/pointfinder?format=json',
      qs: {
        limit: 0,
        query: stopName,
        stopsOnly: true,
        dvb: true,
        assignedStops: true
      }
    }

    return requestP(options)
        .then(JSON.parse)
        .then(function (data) {

        // check status
        if (data.Status &&
            data.Status.Code === 'Ok' &&
            data.Points) {

            return data.Points.map(function (p) {
                return p.split('|');
            }).map(function (p) {
                var city = p[2] === "" ? "Dresden" : p[2]
                return {
                    stop: p[3],
                    id: p[0],
                    city: city,
                    coords: utils.GK4toWGS84(p[4], p[5])
                };
            });
        }
    });
}

var find = function find(searchString, callback) {

    return pointFinder(searchString).nodeify(callback);
};

module.exports = find;
