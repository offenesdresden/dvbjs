'use strict';

var find = require('./lib/find');

var dvb = {
    findStop: find.findStop,
    findPOI: find.findPOI,
    findAddress: find.findAddress,
    monitor: require('./lib/monitor'),
    route: require('./lib/route'),
    pins: require('./lib/pins'),
    coords: require('./lib/coords'),
    lines: require('./lib/lines')
};

module.exports = dvb;
