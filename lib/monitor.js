'use strict';

var find = require('./find');
var requestP = require('request-promise');
var utils = require('./utils');
var bluebird = require('bluebird');

function depatureMonitor(stopid, offset, amount) {

    var now = new Date();
    var time = now;
    if (offset !== 'undefined' && offset !== 0)
        time = new Date(now.getTime() + (offset * 60 * 1000));

    var options = {
        url: 'https://webapi.vvo-online.de/dm?format=json',
        qs: {
            stopid: stopid,
            time: time.toISOString(),
            isarrival: false,
            limit: amount,
            shorttermchanges: true,
            mentzonly: false
        }
    };

    return requestP(options)
        .then(JSON.parse)
        .then(function (data) {
            // check status
            if (data.Status &&
                data.Status.Code == 'Ok' &&
                data.Departures) {

                return data.Departures.map(function (d) {
                    var arrivalTime = new Date(parseInt(d.RealTime ? d.RealTime.match(/\d+/)[0] : d.ScheduledTime.match(/\d+/)[0]));
                    var scheduledTime = new Date(parseInt(d.ScheduledTime.match(/\d+/)[0]));

                    return {
                        line: d.LineName,
                        direction: d.Direction,
                        platform: d.Platform ? { name: d.Platform.Name, type: d.Platform.Type } : undefined,
                        arrivalTime: arrivalTime,
                        arrivalTimeRelative: Math.round((arrivalTime - now) / 1000 / 60),
                        scheduledTime: scheduledTime,
                        scheduledTimeRelative: Math.round((scheduledTime - now) / 1000 / 60),
                        delayTime: Math.round((arrivalTime - scheduledTime) / 1000 / 60),
                        state: d.State ? d.State : 'Unknown',
                        mode: utils.parseMot(d.Mot),
                        diva: d.Diva
                    };
                })
            }
        })
}

var monitor = function monitor(stop, offset, amount, callback) {
    var stopPromise;

    if (typeof(stop) === 'string') {
        stopPromise = find(utils.stripSpaces(stop))
            .then(function (stops) {
                console.log(stops);
                if (!stops || stops.length == 0)
                    throw new Error('no stops found');
                return stops[0].id;
            });
    } else {
        stopPromise = bluebird.resolve(stop);
    }

    return stopPromise
        .then(function (stop) {
            return depatureMonitor(stop, offset, amount);
        })
        .catch(function () {
            return [];
        })
        .nodeify(callback);
};

module.exports = monitor;
