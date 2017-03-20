'use strict';

var find = require('./lib/find');

var dvb = {
    findStop: find.findStop,
    findPOI: find.findPOI,
    address: find.findAddress,
    route: require('./lib/route'),
    monitor: require('./lib/monitor'),
    pins: require('./lib/pins'),
    coords: require('./lib/coords'),
    lines: require('./lib/lines')
};

module.exports = dvb;
