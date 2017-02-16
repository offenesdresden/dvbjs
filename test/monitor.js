'use strict';

var Utils = require('./utils');
var utils = new Utils();
var assert = require('assert');

describe('dvb.monitor', function () {
    describe('dvb.monitor "Postplatz"', function () {
        utils.mockRequest('monitor-postplatz.json');

        function assertTransport(transport) {
            assert(transport.line);
            assert(transport.direction);
            assert.strictEqual('number', typeof transport.arrivalTimeRelative);
            assert.strictEqual('object', typeof transport.arrivalTime);
        }

        it('should return an array with elements', function (done) {
            utils.dvb.monitor('postplatz', 0, 5)
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert(data.length > 0);
                    done()
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should contain all four fields', function (done) {
            utils.dvb.monitor('postplatz', 0, 5)
                .then(function (data) {
                    data.forEach(assertTransport);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should return a Promise but still accept a callback', function () {
            utils.dvb.monitor('postplatz', 0, 5, function (err, data) {
                assert(data);
            }).then(assert)
        });
    });

    describe('dvb.monitor "xxx"', function () {
        utils.mockRequest('monitor-empty.json');

        it('should return an empty array', function (done) {
            utils.dvb.monitor('xxx', 0, 5)
                .then(function (data) {
                    assert(Array.isArray(data));
                    assert.equal(data.length, 0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    })
});
