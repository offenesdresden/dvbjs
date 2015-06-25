'use strict';

var utils = {};

utils.stripSpaces = function stripSpaces(s) {
    return s.replace(/ /g, '');
};

utils.isDresden = function isDresden(point) {
    return 'Dresden' === point.posttown;
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

module.exports = utils;
