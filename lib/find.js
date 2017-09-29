"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestP = require("request-promise");
var bluebird_1 = require("bluebird");
var utils = require("./utils");
function pointFinder(name, stopsOnly, assignedStops) {
    if (typeof name !== 'string') {
        return bluebird_1.Promise.reject(utils.constructError('ValidationError', 'query has to be a string'));
    }
    var stopName = name.trim();
    var options = {
        url: 'https://webapi.vvo-online.de/tr/pointfinder?format=json',
        qs: {
            stopsOnly: stopsOnly,
            assignedStops: assignedStops,
            limit: 0,
            query: stopName,
            dvb: true,
        },
        json: true,
    };
    return requestP(options)
        .then(function (data) {
        // check status of response
        utils.checkStatus(data);
        if (data.Points) {
            return data.Points.map(function (p) {
                var poi = p.split('|');
                var city = poi[2] === '' ? 'Dresden' : poi[2];
                var idAndType = utils.parsePoiID(poi[0]);
                return {
                    city: city,
                    name: poi[3].replace(/'/g, ''),
                    id: idAndType.id,
                    coords: utils.gk4toWgs84(poi[4], poi[5]),
                    type: idAndType.type,
                };
            }).filter(function (p) { return p.name; });
        }
        return [];
    })
        .catch(utils.convertError);
}
function findStop(searchString, callback) {
    return pointFinder(searchString, true, false).asCallback(callback);
}
exports.findStop = findStop;
function findPOI(searchString, callback) {
    return pointFinder(searchString, false, false).asCallback(callback);
}
exports.findPOI = findPOI;
function findAddress(lat, lng, callback) {
    var gk4 = utils.wgs84toGk4(lat, lng);
    return pointFinder("coord:" + gk4[0] + ":" + gk4[1], false, true)
        .then(function (points) {
        if (points.length === 0) {
            return null;
        }
        var address = points[0];
        address.stops = points.slice(1);
        return address;
    }).nodeify(callback);
}
exports.findAddress = findAddress;
//# sourceMappingURL=find.js.map