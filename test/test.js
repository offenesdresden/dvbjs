'use strict';

var fs = require('fs');
var assert = require('assert');
var mockery = require('mockery');
var bluebird = require('bluebird');
var dvb;

function mockRequest(filename) {
    before(function (done) {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        mockery.registerMock('request-promise', function () {
            var response = fs.readFileSync(__dirname + '/data/' + filename, 'utf8');
            return bluebird.resolve(response.trim());
        });

        dvb = require('../index');
        done();
    });

    after(function (done) {
        mockery.disable();
        mockery.deregisterAll();
        done();
    });
}

describe('dvb.monitor "Postplatz"', function() {
    mockRequest('monitor-postplatz.json');

    function assertTransport(transport) {
        assert(transport.line);
        assert(transport.direction);
        assert.strictEqual('number', typeof transport.arrivalTimeRelative);
        assert.strictEqual('object', typeof transport.arrivalTime);
    }

    it('should return an array with elements', function(done) {
        dvb.monitor('postplatz', 0, 5)
        .then(function (data) {
            assert(Array.isArray(data));
            assert(data.length > 0);
            done();
        });
    });

    it('should contain all four fields', function(done) {
        dvb.monitor('postplatz', 0, 5)
        .then(function (data) {
            data.forEach(assertTransport);
            done();
        });
    });

    it('should return a Promise but still accept a callback', function(done) {
        dvb.monitor('postplatz', 0, 5, function (err, data) {
            assert(data);
            done();
        }).then(assert);
    });
});

describe('dvb.route "Prager Straße -> Postplatz"', function() {
    mockRequest('route-pragerstr-postplatz.json');

    function assertTrip(trip) {
        assert(trip.departure);
        assert(trip.arrival);
        assert(trip.duration);
        assert.strictEqual('number', typeof trip.interchange);

        assert(Array.isArray(trip.nodes));
        trip.nodes.forEach(assertNode);
    }

    function assertNode(node) {
        assert(node.mode);
        assert(node.line || node.line === '');
        assert(node.direction || node.direction === '');

        assert.strictEqual('object', typeof node.departure);
        assert(node.departure.stop);
        assert(node.departure.time);

        assert(Array.isArray(node.departure.coords));
        assert.strictEqual(2, node.departure.coords.length);

        assert.strictEqual('object', typeof node.arrival);
        assert(node.arrival.stop);
        assert(node.arrival.time);

        assert(Array.isArray(node.arrival.coords));
        assert.strictEqual(2, node.arrival.coords.length);

        assert(Array.isArray(node.path));
        node.path.forEach(function (path) {
            assert(Array.isArray(path));
            assert.strictEqual(2, path.length);
        });
    }

    it('should return the correct origin and destination', function(done) {
        dvb.route('pragerstrasse', 'postplatz', new Date(), dvb.route.DEPARTURE)
        .then(function (data) {
            assert.strictEqual('Dresden, Prager Straße', data.origin);
            assert.strictEqual('Dresden, Postplatz', data.destination);
            done();
        });
    });

    it('should return an array of trips', function(done) {
        dvb.route('pragerstrasse', 'postplatz', new Date(), dvb.route.DEPARTURE)
        .then(function (data) {
            assert(Array.isArray(data.trips));
            assert(data.trips.length > 0);
            data.trips.forEach(assertTrip);
            done();
        });
    });

    it('should return a Promise but still accept a callback', function(done) {
        dvb.route('pragerstrasse', 'postplatz', new Date(), dvb.route.DEPARTURE, function (err, data) {
            assert(data);
            done();
        }).then(assert);
    });
});

describe('dvb.find "Zellescher Weg"', function() {
    mockRequest('find-zellescherweg.json');

    function assertStop(stop) {
        assert(stop.stop);
        assert(Array.isArray(stop.coords));
        assert.strictEqual(2, stop.coords.length);
    }

    it('should return an array', function(done) {
        dvb.find('zellesch')
        .then(function (data) {
            assert(Array.isArray(data));
            assert(data.length > 0);
            data.forEach(assertStop);
            done();
        });
    });

    it('should find the correct stop', function(done) {
        dvb.find('zellesch')
        .then(function (data) {
            assert.strictEqual('Zellescher Weg', data[0].stop);
            done();
        });
    });

    it('should return a Promise but still accept a callback', function(done) {
        dvb.find('zellesch', function (err, data) {
            assert(data);
            done();
        }).then(assert);
    });
});

describe('dvb.pins "5654791, 4620310, 5657216, 4623119, stop"', function () {
    mockRequest('pins-stop.json');

    it('should resolve into an array', function (done) {
        dvb.pins(5654791, 4620310, 5657216, 4623119, 'stop')
        .then(function (data) {
            assert(Array.isArray(data));
            done();
        });
    });

    it('should contain objects with id, name, coords and connections', function (done) {
       var data = dvb.pins(5654791, 4620310, 5657216, 4623119, 'stop')
       .then(function (data) {
            data.forEach(function(elem) {
                assert(elem.id);
                assert(elem.name);
                assert(elem.coords);
                assert(elem.connections);
            });
            done();
       });
    });

    it('should return a Promise but still accept a callback', function(done) {
        dvb.pins(5654791, 4620310, 5657216, 4623119, 'stop', function (err, data) {
            assert(data);
            done();
        }).then(assert);
    });
});

describe('dvb.address "51.051487, 13.738256"', function () {
    mockRequest('address-51-13.json');

    it('should resolve into an object with city and address properties', function () {
        dvb.address(51.051487, 13.738256)
        .then(function(data) {
            assert(data.address);
            assert(data.city);
        });
    });

    it('should return a Promise but still accept a callback', function(done) {
        dvb.address(51.051487, 13.738256, function (err, data) {
            assert(data);
            done();
        }).then(assert);
    });
});

describe('dvb.coords "33000755"', function() {
    mockRequest('coords-33000755.json');

    it('should resolve into a coordinate array [lat, lng]', function (done) {
        dvb.coords('33000755')
        .then(function (data) {
            assert(Array.isArray(data));
            assert.equal(data.length, 2);
            done();
        });
    });

    it('should return a Promise but still accept a callback', function(done) {
        dvb.coords('3300755', function (err, data) {
            assert(data);
            done();
        }).then(assert);
    });
});
