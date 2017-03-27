'use strict';

var find = require('./find');
var requestP = require('request-promise');
var utils = require('./utils');
var bluebird = require('bluebird');

function monitor(stopID, offset, amount) {

    var now = new Date();
    var time = now;
    if (offset !== 'undefined' && offset !== 0)
        time = new Date(now.getTime() + (offset * 60 * 1000));

    var options = {
        url: 'https://webapi.vvo-online.de/dm?format=json',
        qs: {
            stopid: stopID,
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
                data.Status.Code === 'Ok' &&
                data.Departures) {

                return data.Departures.map(function (d) {
                    var arrivalTime = utils.parseDate(d.RealTime ? d.RealTime : d.ScheduledTime);
                    var scheduledTime = utils.parseDate(d.ScheduledTime);

                    return {
                        id: d.Id,
                        line: d.LineName,
                        direction: d.Direction,
                        platform: utils.parsePlatform(d.Platform),
                        arrivalTime: arrivalTime,
                        scheduledTime: scheduledTime,
                        arrivalTimeRelative: Math.round((arrivalTime - now) / 1000 / 60),
                        scheduledTimeRelative: Math.round((scheduledTime - now) / 1000 / 60),
                        delayTime: Math.round((arrivalTime - scheduledTime) / 1000 / 60),
                        state: d.State ? d.State : 'Unknown',
                        mode: utils.parseMot(d.Mot),
                        diva: utils.parseDiva(d.Diva)
                    };
                })
            }
        })
}

module.exports = monitor;
