'use strict';

var Utils = require('./utils');
var utils = new Utils();
var assert = require('assert');
var _ = require('lodash');
var route = require('../lib/route');

describe('dvb.route', function () {
    describe('dvb.route "Prager Straße -> Postplatz"', function () {
        utils.mockRequest('route-pragerstr-postplatz.json');

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
                assert.strictEqual(51, Math.floor(path[0]));
                assert.strictEqual(13, Math.floor(path[1]));
            });
        }

        it('should return the correct origin and destination', function (done) {
            utils.dvb.route('pragerstrasse', 'postplatz', new Date(), route.DEPARTURE)
                .then(function (data) {
                    assert.strictEqual('Dresden, Prager Straße', data.origin);
                    assert.strictEqual('Dresden, Postplatz', data.destination);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return an array of trips', function (done) {
            utils.dvb.route('pragerstrasse', 'postplatz', new Date(), route.DEPARTURE)
                .then(function (data) {
                    assert(Array.isArray(data.trips));
                    assert(data.trips.length > 0);
                    data.trips.forEach(assertTrip);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return an times as Date', function (done) {
            utils.dvb.route('pragerstrasse', 'postplatz', new Date(), route.DEPARTURE)
                .then(function (data) {
                    assert(Array.isArray(data.trips));
                    assert(data.trips.length > 0);
                    data.trips.forEach(function (trip) {
                        assert(_.isDate(trip.departure));
                        assert(_.isDate(trip.arrival));
                        console.log(trip.arrival),
                        trip.nodes.forEach(function (node) {
                            assert(_.isDate(node.departure.time));
                            assert(_.isDate(node.arrival.time));
                        });
                    });
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function (done) {
            utils.dvb.route('pragerstrasse', 'postplatz', new Date(), route.DEPARTURE, function (err, data) {
                assert(data);
                done();
            }).then(assert);
        });
    });

    describe('dvb.route "0 -> 0"', function () {
        utils.mockRequest('empty_json.json');

        it('should return null', function (done) {
            utils.dvb.route('0', '0', new Date(), route.ARRIVAL)
                .then(function (data) {
                    assert.equal(null, data);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});
