'use strict';

var assert = require('assert');
var dvb = require('../index.js');

describe('dvb.monitor "Postplatz"', function() {
    function assertTransport(transport) {
        assert(transport.line);
        assert(transport.direction);
        assert(typeof transport.arrivaltime === 'number');
    }

    it('should return an array', function(done) {
        dvb.monitor('postplatz', 0, 5, function(err, data) {
            assert.ifError(err);
            assert(Array.isArray(data));
            done();
        });
    });

    it('should contain all three fields', function(done) {
        dvb.monitor('postplatz', 0, 5, function(err, data) {
            assert.ifError(err);
            assert(data.length > 0);
            data.forEach(assertTransport);
            done();
        });
    });
});

describe('dvb.route "Prager Straße -> Postplatz"', function() {
    function assertTrip(trip) {
        assert(trip.departure);
        assert(trip.arrival);
        assert(trip.duration);
        assert(typeof trip.interchange === 'number');

        assert(Array.isArray(trip.nodes));
        trip.nodes.forEach(assertNode);
    }

    function assertNode(node) {
        assert(node.mode);
        assert(node.line || node.line === '');
        assert(node.direction || node.direction === '');

        assert(typeof node.departure === 'object');
        assert(node.departure.stop);
        assert(node.departure.time);

        assert(Array.isArray(node.departure.coords));
        assert(node.departure.coords.length === 2);

        assert(typeof node.arrival === 'object');
        assert(node.arrival.stop);
        assert(node.arrival.time);

        assert(Array.isArray(node.arrival.coords));
        assert(node.arrival.coords.length === 2);

        assert(Array.isArray(node.path));
        node.path.forEach(function (path) {
            assert(Array.isArray(path));
            assert(path.length === 2);
        });
    }

    it('should return the correct origin and destination', function(done) {
        dvb.route('pragerstrasse', 'postplatz', new Date(), dvb.route.DEPATURE, function(err, data) {
            assert.ifError(err);
            assert(data.origin === 'Dresden, Prager Straße');
            assert(data.destination === 'Dresden, Postplatz');
            assert(Array.isArray(data.trips));
            data.trips.forEach(assertTrip);
            done();
        });
    });
});

describe('dvb.find "Zellescher Weg"', function() {
    function assertStop(stop) {
        assert(stop.stop);
        assert(Array.isArray(stop.coords));
        assert(stop.coords.length === 2);
    }

    it('should return an array', function(done) {
        dvb.find('zellesch',function(err, data) {
            assert.ifError(err);
            assert(Array.isArray(data));
            assert(data.length > 0);
            data.forEach(assertStop);
            done();
        });
    });

    it('should find the correct stop', function(done) {
        dvb.find('zellesch', function(err, data) {
            assert.ifError(err);
            assert(data[0].stop === 'Zellescher Weg');
            done();
        });
    });
});
