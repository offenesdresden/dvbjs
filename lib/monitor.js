'use strict';

var requestP = require('request-promise');
var utils = require('./utils');

function monitor(stopID, offset, amount, callback) {

    var now = new Date();
    var time = now;
    if (offset && offset !== 0)
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
        },
        json: true
    };

    return requestP(options)
        .then(function (data) {
            // check status of response
            utils.checkStatus(data);

            if (data.Departures) {
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

            return [];
        })
        .catch(utils.convertError)
        .nodeify(callback);
}

module.exports = monitor;
