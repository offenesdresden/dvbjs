'use strict';

var _ = require('lodash');
var utils = {};

utils.stripSpaces = function stripSpaces(s) {
    return s.replace(/ /g, '');
};

utils.isDresden = function isDresden(point) {
    return 'Dresden' === point.mainLoc;
};

utils.convertCoordinates = function convertCoordinates(s) {
    var coords = s.split(',');
    coords.reverse();

    for (var i = 0; i < 2; i++) {
        coords[i] = parseInt(coords[i]) / 1000000;
    }
    return coords;
};

utils.convertStop = function convertStop(point) {
    return {
        stop: point.object,
        coords: utils.convertCoordinates(point.ref.coords)
    };
};

utils.parsePin =  function parsePin(dataAsString, pinType) {
    if (pinType === 'stop') {
        return {
            id: dataAsString.split('|||')[0],
            name: dataAsString.split('||')[1].split('|')[1],
            coords: [
                dataAsString.split('||')[1].split('|')[2],
                dataAsString.split('||')[1].split('|')[3]
            ],
            connections: dataAsString.split('||')[2]
        };
    } else if (pinType === 'platform') {
        return {
            name: dataAsString.split('||')[1].split('|')[0],
            coords: [
                dataAsString.split('||')[1].split('|')[1],
                dataAsString.split('||')[1].split('|')[2]
            ],
            '?': dataAsString.split('||')[1].split('|')[3]
        };
    } else if (_.contains(['poi', 'rentabike', 'ticketmachine', 'carsharing', 'parkandride'], pinType)) {
        return {
            id: dataAsString.split('||')[0].split(':')[1] + ':' + dataAsString.split('||')[0].split(':')[2],
            name: dataAsString.split('||')[1].split('|')[0],
            coords: [
                dataAsString.split('||')[1].split('|')[1],
                dataAsString.split('||')[1].split('|')[2]
            ]
        };
    }
};

module.exports = utils;
