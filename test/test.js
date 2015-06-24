'use strict';

var fs = require('fs');
var assert = require('assert');
var sinon = require('sinon');
var request = require('request');
var dvb = require('../index.js');

function mockRequest(filename) {
    before(function (done) {
        sinon.stub(request, 'get').yields(null, { statusCode: 200 }, fs.readFileSync(__dirname + '/data/' + filename));
        done();
    });

    after(function (done) {
        request.get.restore();
        done();
    });
}

describe('dvb.monitor "Postplatz"', function() {
    mockRequest('monitor-postplatz.json');

    var now = new Date();

    function assertTransport(transport) {
        assert(transport.line);
        assert(transport.direction);
        assert.strictEqual('number', typeof transport.arrivalTimeRelative);
        assert.strictEqual('object', typeof transport.arrivalTime);
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
    mockRequest('find-zellescherweg.json');

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
