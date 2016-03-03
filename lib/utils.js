'use strict';

var utils = {};
var proj4 = require('proj4');

proj4.defs("GK4", "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m");

utils.WGS84toGK4 = function WGS84toGK4(lat, lng) {
    return proj4("WGS84", "GK4", [lng, lat]).map(Math.round);
};

utils.GK4toWGS84 = function GK4toWGS84(lat, lng) {
    return proj4("GK4", "WGS84", [lng, lat]).reverse();
};

utils.stripSpaces = function stripSpaces(s) {
    return s.replace(/ /g, '');
};

utils.isDresden = function isDresden(point) {
    return 'Dresden' === point.ref.place;
};

utils.convertCoordinates = function convertCoordinates(s) {
    return s.split(',').map(parseFloat).reverse();
};

utils.convertStop = function convertStop(point) {
    return {
        stop: point.object,
        id: point.stateless,
        coords: utils.convertCoordinates(point.ref.coords)
    };
};

module.exports = utils;
