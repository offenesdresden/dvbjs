'use strict';

var find = require('./lib/find');

var dvb = {
    findStop: find.findStop,
    findPOI: find.findPOI,
    address: find.findAddress,
    route: require('./lib/route'),
    monitor: require('./lib/monitor'),
    pins: require('./lib/pins'),
    coords: require('./lib/coords')
};

module.exports = dvb;
// var util = require('util');
// util.inspect.defaultOptions.maxArrayLength = 3;
//
// require('better-log').install({depth: 10});

// dvb.address(51.02836082515807, 13.745858712566005).then(function (data) {
//     console.log(data);
// });


// dvb.findPOI('Frauenkirche Dresden').then(function (data) {
//     console.log(data);
// });

// dvb.findStop('Fehrbellin').then(function (data) {
//     console.log(data);
// });

// dvb.route(33000742, 33000037, new Date(), false)
//     .then(function (data) {
//         console.log(data)
//     });