"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestP = require("request-promise");
var utils = require("./utils");
function monitor(stopID, offset, amount, callback) {
    if (offset === void 0) { offset = 0; }
    if (amount === void 0) { amount = 0; }
    var now = new Date();
    var time = new Date(now.getTime() + (offset * 60 * 1000));
    var options = {
        url: 'https://webapi.vvo-online.de/dm?format=json',
        qs: {
            stopid: stopID,
            time: time.toISOString(),
            isarrival: false,
            limit: amount,
            shorttermchanges: true,
            mentzonly: false,
        },
        json: true,
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
                    arrivalTime: arrivalTime,
                    scheduledTime: scheduledTime,
                    id: d.Id,
                    line: d.LineName,
                    direction: d.Direction,
                    platform: utils.parsePlatform(d.Platform),
                    arrivalTimeRelative: dateDifference(now, arrivalTime),
                    scheduledTimeRelative: dateDifference(now, scheduledTime),
                    delayTime: dateDifference(scheduledTime, arrivalTime),
                    state: d.State ? d.State : 'Unknown',
                    mode: utils.parseMode(d.Mot),
                    diva: utils.parseDiva(d.Diva),
                };
            });
        }
        return [];
    })
        .catch(utils.convertError)
        .nodeify(callback);
}
exports.monitor = monitor;
function dateDifference(start, end) {
    return Math.round((end.getDate() - start.getDate()) / 1000 / 60);
}
//# sourceMappingURL=monitor.js.map