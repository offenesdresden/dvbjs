'use strict';

var assert = require('assert');
var dvb = require('../index.js');

describe('dvb.monitor "Postplatz"', function() {
    function assertTransport(transport) {
        assert(transport.line);
        assert(transport.direction);
        assert.strictEqual('number', typeof transport.arrivaltime);
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
        dvb.route('pragerstrasse', 'postplatz', new Date(), dvb.route.DEPARTURE, function(err, data) {
            assert.ifError(err);
            assert.strictEqual('Dresden, Prager Straße', data.origin);
            assert.strictEqual('Dresden, Postplatz', data.destination);
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
        assert.strictEqual(2, stop.coords.length);
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
            assert.strictEqual('Zellescher Weg', data[0].stop);
            done();
        });
    });
});
